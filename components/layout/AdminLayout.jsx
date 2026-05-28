"use client";

import Link from "next/link";
import { ArrowLeft, Database } from "lucide-react";
import AppShell from "./AppShell.jsx";
import { dm } from "@/lib/design";

export default function AdminLayout({ userEmail, onSignOut, children }) {
  return (
    <AppShell
      userEmail={userEmail}
      onSignOut={onSignOut}
      headerExtra={
        <Link href="/dashboard" className={`hidden sm:inline-flex ${dm.link}`}>
          Dashboard
        </Link>
      }
    >
      <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        <Link
          href="/dashboard"
          className={`mb-6 inline-flex items-center gap-1.5 sm:hidden ${dm.link}`}
        >
          <ArrowLeft className="size-4" aria-hidden />
          Dashboard
        </Link>

        <div className="mb-8 flex items-start gap-4">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#2563eb]/15">
            <Database className="size-5 text-[#60a5fa]" aria-hidden />
          </div>
          <div>
            <h1 className="font-[family-name:var(--font-heading)] text-2xl font-semibold text-white">
              Knowledge base admin
            </h1>
            <p className={`mt-1 text-sm ${dm.muted}`}>
              Upload and manage company PDF namespaces.
            </p>
          </div>
        </div>

        {children}
      </div>
    </AppShell>
  );
}
