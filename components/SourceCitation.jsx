"use client";

import { useState } from "react";
import { ChevronDown, Paperclip } from "lucide-react";

export default function SourceCitation({ sources }) {
  const [open, setOpen] = useState(false);

  if (!sources?.length) {
    return null;
  }

  const count = sources.length;

  return (
    <div className="mt-3 border-t border-slate-700/50 pt-2">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        className={`inline-flex cursor-pointer items-center gap-1 text-xs text-slate-400 transition-colors hover:text-slate-200`}
      >
        <Paperclip className="size-3.5" aria-hidden />
        {count} {count === 1 ? "source" : "sources"}
        <ChevronDown
          className={`size-3.5 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>
      {open && (
        <ul className="mt-2 flex flex-wrap gap-1.5" aria-label="Sources">
          {sources.map((source, index) => {
            const { filename, page } = source;
            const label =
              page != null ? `${filename} · p. ${page}` : filename;
            return (
              <li key={`${filename}-${page}-${index}`}>
                <span className="inline-block rounded-full border border-slate-700/80 bg-slate-800/80 px-2.5 py-0.5 text-xs text-slate-300">
                  {label}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
