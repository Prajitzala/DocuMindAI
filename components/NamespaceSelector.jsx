"use client";

import {
  Building2,
  FileText,
  Gavel,
  Wrench,
} from "lucide-react";
import { dm } from "@/lib/design";

const NAMESPACES = [
  { id: "user-upload", label: "My PDFs", icon: FileText },
  { id: "kb-hr", label: "HR docs", icon: Building2 },
  { id: "kb-legal", label: "Legal docs", icon: Gavel },
  { id: "kb-engineering", label: "Engineering", icon: Wrench },
];

export default function NamespaceSelector({ selected, onSelect }) {
  return (
    <aside className="flex h-full w-full flex-col px-3 py-4 md:px-4 md:py-5">
      <p className={`mb-3 hidden px-2 md:block ${dm.label}`}>Sources</p>
      <nav
        className="flex gap-1 overflow-x-auto pb-1 md:flex-col md:overflow-visible md:pb-0"
        aria-label="Document namespaces"
      >
        {NAMESPACES.map(({ id, label, icon: Icon }) => {
          const isActive = selected === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onSelect(id)}
              aria-current={isActive ? "page" : undefined}
              className={`flex shrink-0 cursor-pointer items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563eb] md:w-full ${
                isActive
                  ? "bg-[#2563eb] text-white"
                  : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
              }`}
            >
              <Icon className="size-4 shrink-0" aria-hidden />
              <span className="whitespace-nowrap">{label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
