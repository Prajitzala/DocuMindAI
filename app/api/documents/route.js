import {
  createClient,
  createServiceClient,
} from "../../../lib/supabase-server.js";

const USER_NAMESPACE = "user-upload";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("documents")
      .select("metadata, created_at")
      .eq("user_id", user.id)
      .eq("namespace", USER_NAMESPACE);

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    const byFilename = new Map();

    for (const row of data ?? []) {
      const filename = row.metadata?.filename;
      if (!filename) continue;

      const existing = byFilename.get(filename);
      const createdAt = row.created_at;

      if (!existing) {
        byFilename.set(filename, { filename, chunkCount: 1, createdAt });
      } else {
        existing.chunkCount += 1;
        if (createdAt < existing.createdAt) {
          existing.createdAt = createdAt;
        }
      }
    }

    const documents = [...byFilename.values()].sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt)
    );

    return Response.json({ documents });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to list documents";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request) {
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
    const filename =
      typeof body?.filename === "string" ? body.filename.trim() : "";

    if (!filename) {
      return Response.json({ error: "filename is required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("documents")
      .delete()
      .eq("user_id", user.id)
      .eq("namespace", USER_NAMESPACE)
      .filter("metadata->>filename", "eq", filename)
      .select("id");

    if (error) {
      return Response.json(
        { error: `Delete failed: ${error.message}` },
        { status: 500 }
      );
    }

    const serviceSupabase = createServiceClient();
    const { data: storageFiles } = await serviceSupabase.storage
      .from("pdfs")
      .list(user.id);

    const pathsToRemove = (storageFiles ?? [])
      .filter((obj) => obj.name.endsWith(`-${filename}`))
      .map((obj) => `${user.id}/${obj.name}`);

    if (pathsToRemove.length > 0) {
      await serviceSupabase.storage.from("pdfs").remove(pathsToRemove);
    }

    return Response.json({
      success: true,
      deleted: data?.length ?? 0,
      filename,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Delete failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
