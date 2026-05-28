"use client";

import { useState } from "react";
import { FileText, Loader2, Trash2 } from "lucide-react";
import { dm } from "@/lib/design";

export default function UserPDFList({
  documents,
  loading,
  error,
  onDelete,
  onRefresh,
}) {
  const [deleting, setDeleting] = useState(null);
  const [deleteError, setDeleteError] = useState(null);

  const handleDelete = async (filename) => {
    if (deleting) return;

    const confirmed = window.confirm(
      `Delete "${filename}" and all its indexed chunks? This cannot be undone.`,
    );
    if (!confirmed) return;

    setDeleting(filename);
    setDeleteError(null);

    try {
      const response = await fetch("/api/documents", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "Delete failed");
      }

      onDelete?.(filename);
      await onRefresh?.();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <p className={`mb-3 flex items-center gap-2 text-xs ${dm.muted}`}>
        <Loader2 className="size-3.5 animate-spin" aria-hidden />
        Loading your PDFs…
      </p>
    );
  }

  const displayError = deleteError || error;

  if (documents.length === 0) {
    return displayError ? (
      <p className={`mb-3 ${dm.alertError}`} role="alert">
        {displayError}
      </p>
    ) : null;
  }

  return (
    <div className="mb-4">
      <h3 className={`mb-2 ${dm.label}`}>Your uploaded PDFs</h3>
      <ul className="space-y-2">
        {documents.map((doc) => (
          <li
            key={doc.filename}
            className={`${dm.card} flex items-center justify-between gap-2 px-3 py-2.5`}
          >
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <FileText
                className="size-4 shrink-0 text-[#60a5fa]"
                aria-hidden
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-100">
                  {doc.filename}
                </p>
                <p className="text-xs text-slate-500">
                  {doc.chunkCount} {doc.chunkCount === 1 ? "chunk" : "chunks"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleDelete(doc.filename)}
              disabled={deleting === doc.filename}
              className={`${dm.btnDanger} inline-flex items-center gap-1`}
              aria-label={`Delete ${doc.filename}`}
            >
              <Trash2 className="size-3.5" aria-hidden />
              {deleting === doc.filename ? "Deleting…" : "Delete"}
            </button>
          </li>
        ))}
      </ul>
      {displayError && (
        <p className={`mt-2 ${dm.alertError}`} role="alert">
          {displayError}
        </p>
      )}
    </div>
  );
}
