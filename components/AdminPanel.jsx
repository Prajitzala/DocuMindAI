"use client";

import { useRef, useState } from "react";
import { CheckCircle2, Upload } from "lucide-react";
import { dm } from "@/lib/design";

const KB_NAMESPACES = [
  { id: "kb-hr", label: "HR" },
  { id: "kb-legal", label: "Legal" },
  { id: "kb-engineering", label: "Engineering" },
];

const MAX_BYTES = 10 * 1024 * 1024;

function validateFile(file) {
  if (file.type !== "application/pdf") {
    return "File must be a PDF.";
  }
  if (file.size > MAX_BYTES) {
    return "File must be under 10MB.";
  }
  return null;
}

export default function AdminPanel() {
  const inputRef = useRef(null);

  const [namespace, setNamespace] = useState("kb-hr");
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const clearFeedback = () => {
    setError(null);
    setSuccess(null);
  };

  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) return;

    clearFeedback();

    const validationError = validateFile(selectedFile);
    if (validationError) {
      setFile(null);
      setError(validationError);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file || loading) return;

    setLoading(true);
    clearFeedback();

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("namespace", namespace);

      const response = await fetch("/api/admin", {
        method: "POST",
        body: formData,
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setSuccess(
        `Uploaded successfully — ${data.chunks ?? 0} chunks indexed.`,
      );
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const onNamespaceChange = (event) => {
    setNamespace(event.target.value);
    clearFeedback();
  };

  return (
    <div className="space-y-8">
      <section className={`${dm.card} space-y-3 p-5`}>
        <label
          htmlFor="admin-namespace"
          className="block text-sm font-medium text-slate-300"
        >
          Namespace
        </label>
        <select
          id="admin-namespace"
          value={namespace}
          onChange={onNamespaceChange}
          disabled={loading}
          className={dm.input}
        >
          {KB_NAMESPACES.map(({ id, label }) => (
            <option key={id} value={id}>
              {label} ({id})
            </option>
          ))}
        </select>
      </section>

      <section className={`${dm.card} space-y-4 p-5`}>
        <h2 className="font-[family-name:var(--font-heading)] text-lg font-medium text-white">
          Upload document
        </h2>

        <div
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              inputRef.current?.click();
            }
          }}
          onClick={() => inputRef.current?.click()}
          onDragOver={(event) => {
            event.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={(event) => {
            event.preventDefault();
            setDragOver(false);
          }}
          onDrop={(event) => {
            event.preventDefault();
            setDragOver(false);
            handleFileSelect(event.dataTransfer.files?.[0]);
          }}
          className={`${dm.dropzone} ${
            dragOver ? dm.dropzoneActive : dm.dropzoneIdle
          }`}
        >
          <Upload className="mb-2 size-8 text-slate-500" aria-hidden />
          <p className="text-sm text-slate-300">Drop a PDF here or click to browse</p>
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf,.pdf"
            className="hidden"
            disabled={loading}
            onChange={(event) => handleFileSelect(event.target.files?.[0])}
          />
        </div>

        {file && (
          <p className="text-sm text-slate-300">
            Selected: <span className="font-medium text-white">{file.name}</span>
          </p>
        )}

        <button
          type="button"
          onClick={handleUpload}
          disabled={!file || loading}
          className={dm.btnPrimary}
        >
          {loading ? "Uploading…" : "Upload to knowledge base"}
        </button>

        {error && (
          <p className={dm.alertError} role="alert">
            {error}
          </p>
        )}

        {success && (
          <p className={`flex items-center gap-1.5 ${dm.alertSuccess}`} role="status">
            <CheckCircle2 className="size-4 shrink-0" aria-hidden />
            {success}
          </p>
        )}
      </section>

      <section className={`${dm.card} space-y-2 p-5`}>
        <h2 className="font-[family-name:var(--font-heading)] text-lg font-medium text-white">
          Documents
        </h2>
        <p className="rounded-xl border border-dashed border-slate-700/80 px-4 py-8 text-center text-sm text-slate-500">
          Uploaded KB documents appear here
        </p>
      </section>
    </div>
  );
}
