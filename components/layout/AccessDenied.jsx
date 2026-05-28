import Link from "next/link";
import { ShieldX } from "lucide-react";
import { dm } from "@/lib/design";

export default function AccessDenied({
  title = "Access denied",
  message = "You do not have permission to view this page.",
  backHref = "/dashboard",
  backLabel = "Back to dashboard",
}) {
  return (
    <div className={`${dm.page} flex items-center justify-center px-4`}>
      <div
        className={`${dm.cardSolid} w-full max-w-md p-8 text-center shadow-2xl shadow-blue-950/10`}
      >
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-red-950/40">
          <ShieldX className="size-6 text-red-400" aria-hidden />
        </div>
        <h1 className="font-[family-name:var(--font-heading)] text-xl font-semibold text-white">
          {title}
        </h1>
        <p className={`mt-2 text-sm ${dm.muted}`}>{message}</p>
        <Link href={backHref} className={`mt-6 inline-block ${dm.link}`}>
          {backLabel}
        </Link>
      </div>
    </div>
  );
}
