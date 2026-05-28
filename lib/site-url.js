/**
 * Canonical app origin for OAuth redirects.
 * Set NEXT_PUBLIC_SITE_URL on Vercel (e.g. https://your-app.vercel.app).
 */
export function getSiteUrl() {
  if (typeof window !== "undefined") {
    return (
      process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
      window.location.origin
    );
  }

  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "http://localhost:3000";
}

export function getAuthCallbackUrl(next = "/dashboard") {
  const nextPath = next.startsWith("/") ? next : `/${next}`;
  return `${getSiteUrl()}/auth/callback?next=${encodeURIComponent(nextPath)}`;
}
