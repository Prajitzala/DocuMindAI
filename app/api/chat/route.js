import { ChatOpenAI } from "@langchain/openai";
import { createClient } from "../../../lib/supabase-server.js";
import { queryDocuMind } from "../../../lib/rag.js";

const ALLOWED_NAMESPACES = new Set([
  "user-upload",
  "kb-hr",
  "kb-legal",
  "kb-engineering",
]);

function buildPrompt(question, chunks) {
  const context = chunks.map((chunk) => chunk.content).join("\n\n");

  return `Answer the question based only on the provided context.
If the answer isn't in the context, say so clearly.

Context:
${context}

Question: ${question}`;
}

function buildSources(chunks) {
  const seen = new Set();
  const sources = [];

  for (const chunk of chunks) {
    const filename = chunk.metadata?.filename;
    if (!filename) continue;

    const page =
      chunk.metadata?.page ?? chunk.metadata?.loc?.pageNumber ?? null;
    const key = `${filename}:${page}`;
    if (seen.has(key)) continue;

    seen.add(key);
    sources.push({ filename, page });
  }

  return sources;
}

function getChunkText(chunk) {
  if (typeof chunk.content === "string") {
    return chunk.content;
  }

  if (Array.isArray(chunk.content)) {
    return chunk.content
      .filter((part) => part.type === "text")
      .map((part) => part.text)
      .join("");
  }

  return "";
}

function formatSseData(payload) {
  const lines = String(payload).split("\n");
  return `data: ${lines.join("\ndata: ")}\n\n`;
}

export async function POST(request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const question =
      typeof body?.question === "string" ? body.question.trim() : "";
    const namespace =
      typeof body?.namespace === "string" ? body.namespace.trim() : "";

    if (!question) {
      return Response.json(
        { error: "question must be a non-empty string" },
        { status: 400 }
      );
    }

    if (!ALLOWED_NAMESPACES.has(namespace)) {
      return Response.json({ error: "Invalid namespace" }, { status: 400 });
    }

    const { chunks } = await queryDocuMind(question, namespace);
    const sources = buildSources(chunks);
    const prompt = buildPrompt(question, chunks);

    const model = new ChatOpenAI({
      model: "gpt-4o",
      streaming: true,
    });

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const tokenStream = await model.stream(prompt);

          for await (const chunk of tokenStream) {
            const token = getChunkText(chunk);
            if (token) {
              controller.enqueue(encoder.encode(formatSseData(token)));
            }
          }

          controller.enqueue(
            encoder.encode(formatSseData(JSON.stringify({ sources })))
          );
          controller.close();
        } catch (streamError) {
          const message =
            streamError instanceof Error
              ? streamError.message
              : "Stream failed";
          controller.enqueue(
            encoder.encode(formatSseData(JSON.stringify({ error: message })))
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Chat request failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
