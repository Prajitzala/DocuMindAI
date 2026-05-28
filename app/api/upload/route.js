import {
  createClient,
  createServiceClient,
} from "../../../lib/supabase-server.js";
import { ingestPDF } from "../../../lib/rag.js";

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const ALLOWED_NAMESPACES = new Set([
  "user-upload",
  "kb-hr",
  "kb-legal",
  "kb-engineering",
]);

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

    const formData = await request.formData();
    const file = formData.get("file");
    const namespace =
      formData.get("namespace")?.toString().trim() || "user-upload";

    if (!file || typeof file === "string") {
      return Response.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return Response.json(
        { error: "File must be a PDF (application/pdf)" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_BYTES) {
      return Response.json(
        { error: "File must be under 10MB" },
        { status: 400 }
      );
    }

    if (!ALLOWED_NAMESPACES.has(namespace)) {
      return Response.json({ error: "Invalid namespace" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const filename = file.name;
    const storagePath = `${user.id}/${Date.now()}-${filename}`;

    const serviceSupabase = createServiceClient();
    const { error: storageError } = await serviceSupabase.storage
      .from("pdfs")
      .upload(storagePath, buffer, {
        contentType: "application/pdf",
        upsert: false,
      });

    if (storageError) {
      return Response.json(
        { error: `Storage upload failed: ${storageError.message}` },
        { status: 500 }
      );
    }

    const { chunks } = await ingestPDF(buffer, filename, user.id, namespace);

    return Response.json({
      success: true,
      filename,
      chunks,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Upload failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
