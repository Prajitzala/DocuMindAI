import { createClient } from "../../../lib/supabase-server.js";
import { ingestPDF } from "../../../lib/rag.js";

const KB_NAMESPACES = new Set(["kb-hr", "kb-legal", "kb-engineering"]);

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { supabase: null, user: null, response: Response.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  if (user.user_metadata?.role !== "admin") {
    return { supabase: null, user: null, response: Response.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { supabase, user, response: null };
}

export async function POST(request) {
  try {
    const { user, response: authResponse } = await requireAdmin();
    if (authResponse) return authResponse;

    const formData = await request.formData();
    const file = formData.get("file");
    const namespace = formData.get("namespace")?.toString().trim() ?? "";

    if (!file || typeof file === "string") {
      return Response.json({ error: "No file provided" }, { status: 400 });
    }

    if (!KB_NAMESPACES.has(namespace)) {
      return Response.json(
        { error: "namespace must be kb-hr, kb-legal, or kb-engineering" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = file.name;

    const { chunks } = await ingestPDF(buffer, filename, user.id, namespace);

    return Response.json({ success: true, chunks });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Admin upload failed";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { supabase, response: authResponse } = await requireAdmin();
    if (authResponse) return authResponse;

    const body = await request.json();
    const filename =
      typeof body?.filename === "string" ? body.filename.trim() : "";
    const namespace =
      typeof body?.namespace === "string" ? body.namespace.trim() : "";

    if (!filename) {
      return Response.json({ error: "filename is required" }, { status: 400 });
    }

    if (!KB_NAMESPACES.has(namespace)) {
      return Response.json(
        { error: "namespace must be kb-hr, kb-legal, or kb-engineering" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("documents")
      .delete()
      .eq("namespace", namespace)
      .filter("metadata->>filename", "eq", filename)
      .select("id");

    if (error) {
      return Response.json(
        { error: `Delete failed: ${error.message}` },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      deleted: data?.length ?? 0,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Admin delete failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
