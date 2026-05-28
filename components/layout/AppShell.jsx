"use client";

import Link from "next/link";
import { dm } from "@/lib/design";

export default function AppShell({
  userEmail,
  onSignOut,
  sidebar,
  children,
  headerExtra,
}) {
  return (
    <div className={`${dm.page} flex min-h-screen flex-col`}>
      <div
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_60%_40%_at_100%_0%,rgba(37,99,235,0.12),transparent)]"
        aria-hidden
      />

      <header className={`${dm.header} relative`}>
        <Link href="/dashboard" className={dm.logo}>
          <span className={dm.logoMark}>DM</span>
          <span className={dm.logoText}>DocuMind AI</span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          {headerExtra}
          {userEmail ? (
            <span className="hidden max-w-[10rem] truncate text-sm text-slate-400 sm:inline md:max-w-[14rem]">
              {userEmail}
            </span>
          ) : null}
          <button type="button" onClick={onSignOut} className={dm.btnGhost}>
            Sign out
          </button>
        </div>
      </header>

      <div className="relative flex min-h-0 flex-1 flex-col md:flex-row">
        {sidebar ? (
          <div className="shrink-0 border-b border-slate-800/80 md:w-64 md:border-b-0 md:border-r">
            {sidebar}
          </div>
        ) : null}
        <main className="flex min-h-0 min-w-0 flex-1 flex-col">{children}</main>
      </div>
    </div>
  );
}
