/** Shared DocuMind design tokens (matches landing page). */
export const dm = {
  page: "min-h-screen bg-[#0b0f14] text-slate-100",
  header:
    "sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between border-b border-slate-800/80 bg-[#0b0f14]/90 px-4 backdrop-blur-md sm:px-6",
  logo: "flex items-center gap-2 font-semibold tracking-tight",
  logoMark:
    "flex size-8 items-center justify-center rounded-lg bg-[#2563eb] text-xs font-bold text-white",
  logoText: "font-[family-name:var(--font-heading)] text-base text-white",
  card: "rounded-2xl border border-slate-800/80 bg-slate-900/50",
  cardSolid: "rounded-2xl border border-slate-800/80 bg-slate-900/70",
  muted: "text-slate-400",
  label: "text-xs font-medium uppercase tracking-wide text-slate-500",
  input:
    "w-full rounded-lg border border-slate-700/80 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#2563eb]/50 disabled:opacity-50",
  btnPrimary:
    "cursor-pointer rounded-lg bg-[#2563eb] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1d4ed8] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563eb]",
  btnGhost:
    "cursor-pointer rounded-lg border border-slate-700/80 px-3 py-1.5 text-sm font-medium text-slate-300 transition-colors hover:border-slate-600 hover:bg-slate-800/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500",
  btnDanger:
    "cursor-pointer rounded-md px-2 py-1 text-xs font-medium text-red-400 transition-colors hover:bg-red-950/40 disabled:opacity-50",
  link: "cursor-pointer text-sm font-medium text-[#60a5fa] transition-colors hover:text-[#93c5fd]",
  dropzone:
    "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors",
  dropzoneIdle:
    "border-slate-700/80 bg-slate-900/30 hover:border-slate-600 hover:bg-slate-900/50",
  dropzoneActive: "border-[#2563eb] bg-[#2563eb]/10",
  alertError:
    "rounded-lg border border-red-900/50 bg-red-950/30 px-3 py-2 text-sm text-red-400",
  alertSuccess: "text-sm text-emerald-400",
};
