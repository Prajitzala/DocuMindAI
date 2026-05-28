"use client";

import { useState } from "react";
import { createClient } from "../lib/supabase.js";
import { dm } from "@/lib/design";

const supabase = createClient();

export default function AuthModal({ onSuccess, inline = false }) {
  const [tab, setTab] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [signUpSent, setSignUpSent] = useState(false);

  const switchTab = (nextTab) => {
    setTab(nextTab);
    setError(null);
    setSignUpSent(false);
  };

  const handleSignIn = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    onSuccess?.();
  };

  const handleSignUp = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSignUpSent(false);

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    setSignUpSent(true);
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
      },
    });

    setLoading(false);

    if (oauthError) {
      setError(oauthError.message);
    }
  };

  const isSignIn = tab === "signin";

  return (
    <div
      className={
        inline
          ? "w-full p-5"
          : "fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
      }
    >
      <div
        className={`w-full ${inline ? "" : `max-w-md ${dm.cardSolid} p-6 shadow-2xl`}`}
      >
        <h2 className="mb-6 text-center font-[family-name:var(--font-heading)] text-xl font-semibold text-white">
          {inline ? "Get started" : "Welcome to DocuMind AI"}
        </h2>

        <div className="mb-6 flex rounded-lg border border-slate-800/80 bg-slate-950/50 p-1">
          <button
            type="button"
            onClick={() => switchTab("signin")}
            className={`flex-1 cursor-pointer rounded-md py-2 text-sm font-medium transition-colors ${
              isSignIn
                ? "bg-[#2563eb] text-white"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => switchTab("signup")}
            className={`flex-1 cursor-pointer rounded-md py-2 text-sm font-medium transition-colors ${
              !isSignIn
                ? "bg-[#2563eb] text-white"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Sign up
          </button>
        </div>

        {signUpSent ? (
          <p className={`mb-4 text-center text-sm ${dm.alertSuccess}`}>
            Check your email to confirm your account.
          </p>
        ) : (
          <form
            onSubmit={isSignIn ? handleSignIn : handleSignUp}
            className="space-y-4"
          >
            <div>
              <label
                htmlFor="auth-email"
                className="mb-1 block text-sm font-medium text-slate-300"
              >
                Email
              </label>
              <input
                id="auth-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={loading}
                className={dm.input}
              />
            </div>

            <div>
              <label
                htmlFor="auth-password"
                className="mb-1 block text-sm font-medium text-slate-300"
              >
                Password
              </label>
              <input
                id="auth-password"
                type="password"
                autoComplete={isSignIn ? "current-password" : "new-password"}
                required
                minLength={6}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={loading}
                className={dm.input}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full ${dm.btnPrimary} py-2.5`}
            >
              {loading ? "Please wait…" : isSignIn ? "Sign in" : "Sign up"}
            </button>
          </form>
        )}

        {error && (
          <p className={`mt-3 ${dm.alertError}`} role="alert">
            {error}
          </p>
        )}

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-800" />
          <span className="text-xs text-slate-500">or</span>
          <div className="h-px flex-1 bg-slate-800" />
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className={`flex w-full items-center justify-center gap-2 py-2.5 ${dm.btnGhost}`}
        >
          <svg className="size-4" viewBox="0 0 24 24" aria-hidden>
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </button>
      </div>
    </div>
  );
}
