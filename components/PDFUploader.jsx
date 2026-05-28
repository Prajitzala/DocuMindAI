"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CheckCircle2, Upload } from "lucide-react";
import { dm } from "@/lib/design";

const MAX_BYTES = 10 * 1024 * 1024;

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function validateFile(file) {
  if (file.type !== "application/pdf") {
    return "File must be a PDF.";
  }
  if (file.size > MAX_BYTES) {
    return "File must be under 10MB.";
  }
  return null;
}

export default function PDFUploader({ namespace, onUploadComplete }) {
  const inputRef = useRef(null);
  const progressIntervalRef = useRef(null);

  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [success, setSuccess] = useState(null);

  const clearProgressInterval = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => clearProgressInterval();
  }, [clearProgressInterval]);

  const reset = useCallback(() => {
    clearProgressInterval();
    setDragOver(false);
    setFile(null);
    setError(null);
    setUploading(false);
    setProgress(0);
    setSuccess(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }, [clearProgressInterval]);

  const startUpload = useCallback(
    async (selectedFile) => {
      setUploading(true);
      setProgress(0);
      setError(null);
      setSuccess(null);

      progressIntervalRef.current = setInterval(() => {
        setProgress((prev) => (prev >= 90 ? 90 : prev + 4));
      }, 150);

      try {
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("namespace", namespace);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data.error || "Upload failed");
        }

        clearProgressInterval();
        setProgress(100);
        setSuccess({
          filename: data.filename ?? selectedFile.name,
          chunks: data.chunks ?? 0,
        });
        onUploadComplete?.();
      } catch (err) {
        clearProgressInterval();
        setProgress(0);
        setError(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [namespace, onUploadComplete, clearProgressInterval],
  );

  const handleFile = useCallback(
    (selectedFile) => {
      if (!selectedFile) return;

      const validationError = validateFile(selectedFile);
      if (validationError) {
        setFile(null);
        setSuccess(null);
        setUploading(false);
        setError(validationError);
        setProgress(0);
        clearProgressInterval();
        return;
      }

      setError(null);
      setSuccess(null);
      setFile(selectedFile);
      startUpload(selectedFile);
    },
    [startUpload, clearProgressInterval],
  );

  const onDragOver = (event) => {
    event.preventDefault();
    setDragOver(true);
  };

  const onDragLeave = (event) => {
    event.preventDefault();
    setDragOver(false);
  };

  const onDrop = (event) => {
    event.preventDefault();
    setDragOver(false);
    const dropped = event.dataTransfer.files?.[0];
    handleFile(dropped);
  };

  const onInputChange = (event) => {
    const selected = event.target.files?.[0];
    handleFile(selected);
  };

  const showDropZone = !file && !uploading && !success;

  return (
    <div className="w-full">
      {showDropZone && (
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
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={`${dm.dropzone} ${
            dragOver ? dm.dropzoneActive : dm.dropzoneIdle
          }`}
        >
          <Upload className="mb-2 size-8 text-slate-500" aria-hidden />
          <p className="text-sm text-slate-300">Drop your PDF here or click to browse</p>
          <p className="mt-1 text-xs text-slate-500">PDF only · max 10MB</p>
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf,.pdf"
            className="hidden"
            onChange={onInputChange}
          />
        </div>
      )}

      {error && (
        <p className={`mt-2 ${dm.alertError}`} role="alert">
          {error}
        </p>
      )}

      {file && (
        <div className={`${dm.cardSolid} p-4`}>
          <p className="text-sm font-medium text-slate-100">{file.name}</p>
          <p className="mt-0.5 text-xs text-slate-500">
            {formatFileSize(file.size)}
          </p>

          {uploading && (
            <div className="mt-3">
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-[#2563eb] transition-all duration-150"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className={`mt-1 text-xs ${dm.muted}`}>
                Uploading… {progress}%
              </p>
            </div>
          )}

          {success && (
            <p className={`mt-3 flex items-center gap-1.5 ${dm.alertSuccess}`}>
              <CheckCircle2 className="size-4 shrink-0" aria-hidden />
              Uploaded — {success.chunks} chunks indexed
            </p>
          )}
        </div>
      )}

      {(file || error) && (
        <button type="button" onClick={reset} className={`mt-3 ${dm.btnGhost}`}>
          Upload another file
        </button>
      )}
    </div>
  );
}
