import { Document } from "@langchain/core/documents";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { OpenAIEmbeddings } from "@langchain/openai";
import { createClient } from "./supabase-server.js";
import { parsePDF } from "./pdf-parser.js";

const EMBEDDING_MODEL = "text-embedding-3-small";
const TABLE_NAME = "documents";
const QUERY_NAME = "match_documents";

function createEmbeddings() {
  return new OpenAIEmbeddings({ model: EMBEDDING_MODEL });
}

async function createVectorStore(embeddings) {
  return new SupabaseVectorStore(embeddings, {
    client: await createClient(),
    tableName: TABLE_NAME,
    queryName: QUERY_NAME,
  });
}

/**
 * Upsert chunks via SupabaseVectorStore embeddings + client.
 * Extends the store's addVectors row shape with required table columns.
 */
async function storeDocuments(vectorStore, documents, userId, namespace) {
  const texts = documents.map(({ pageContent }) => pageContent);
  const vectors = await vectorStore.embeddings.embedDocuments(texts);

  const rows = vectors.map((embedding, idx) => ({
    content: documents[idx].pageContent,
    embedding,
    metadata: documents[idx].metadata,
    user_id: userId,
    namespace,
  }));

  let storedCount = 0;
  const batchSize = vectorStore.upsertBatchSize ?? 500;

  for (let i = 0; i < rows.length; i += batchSize) {
    const chunk = rows.slice(i, i + batchSize);
    const { data, error } = await vectorStore.client
      .from(vectorStore.tableName)
      .upsert(chunk)
      .select();

    if (error) {
      throw new Error(
        `Error inserting documents: ${error.message} ${error.code ?? ""}`.trim()
      );
    }

    storedCount += data?.length ?? 0;
  }

  return storedCount;
}

/**
 * Parse a PDF, embed chunks, and store them in Supabase pgvector.
 */
export async function ingestPDF(fileBuffer, fileName, userId, namespace) {
  try {
    const parsedChunks = await parsePDF(fileBuffer);

    const documents = parsedChunks.map(
      (doc) =>
        new Document({
          pageContent: doc.pageContent,
          metadata: {
            ...doc.metadata,
            filename: fileName,
            user_id: userId,
            namespace,
            ...(doc.metadata?.loc?.pageNumber != null && {
              page: doc.metadata.loc.pageNumber,
            }),
          },
        })
    );

    const embeddings = createEmbeddings();
    const vectorStore = await createVectorStore(embeddings);
    const chunks = await storeDocuments(
      vectorStore,
      documents,
      userId,
      namespace
    );

    return { success: true, chunks };
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(`ingestPDF failed: ${detail}`);
  }
}

/**
 * Retrieve the most similar document chunks for a question (no LLM call).
 */
export async function queryDocuMind(question, namespace, topK = 5) {
  try {
    const embeddings = createEmbeddings();
    const vectorStore = await SupabaseVectorStore.fromExistingIndex(embeddings, {
      client: await createClient(),
      tableName: TABLE_NAME,
      queryName: QUERY_NAME,
    });

    const results = await vectorStore.similaritySearch(question, topK, {
      namespace,
    });

    return {
      chunks: results.map((doc) => ({
        content: doc.pageContent,
        metadata: doc.metadata,
      })),
    };
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(`queryDocuMind failed: ${detail}`);
  }
}
