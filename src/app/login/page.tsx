"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

// NEXT_PUBLIC_* vars are inlined into the browser bundle at build time, so a
// missing value here means the deploy that produced this page was built
// without the Supabase keys (or before they were added — redeploy needed).
const configured =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export default function LoginPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!configured) {
      setError(
        "Sign-in isn't configured on this deploy yet (missing Supabase keys). " +
          "Add them in Vercel and redeploy.",
      );
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const supabase = createClient();
      const creds = { email: email.trim(), password };
      const { data, error } =
        mode === "signup"
          ? await supabase.auth.signUp(creds)
          : await supabase.auth.signInWithPassword(creds);

      if (error) {
        setError(error.message);
      } else if (mode === "signup" && !data.session) {
        // No session back on sign-up means Supabase is set to require email
        // confirmation. Tell the owner how to turn that off (no SMTP needed).
        setError(
          "Account made, but this Supabase project is set to require email " +
            "confirmation. Turn off Authentication → Providers → Email → " +
            "“Confirm email” in Supabase, then sign in.",
        );
      } else {
        // Signed in. Full navigation so the server re-reads the new cookie and
        // routes us to /welcome (no family yet) or the home page.
        window.location.assign("/");
      }
    } catch (err) {
      console.error("auth failed", err);
      setError(err instanceof Error ? err.message : "Something went wrong — please try again.");
    }
    setBusy(false);
  }

  return (
    <main className="mx-auto flex min-h-full w-full max-w-sm flex-col items-center justify-center px-5 py-16">
      <div className="w-full rounded-4xl bg-white px-8 py-10 text-center shadow-lg">
        <div className="text-5xl">🌟</div>
        <h1 className="mt-2 font-display text-4xl font-bold text-sky-600">Wonderwise</h1>
        <p className="mt-2 text-slate-500">
          {mode === "signup" ? "Create a grown-up account" : "Grown-up sign in"}
        </p>

        {!configured && (
          <p className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
            🔑 Sign-in isn't turned on for this deploy yet. Add{" "}
            <code className="rounded bg-amber-100 px-1">NEXT_PUBLIC_SUPABASE_URL</code>{" "}
            and{" "}
            <code className="rounded bg-amber-100 px-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>{" "}
            in Vercel, then redeploy.
          </p>
        )}

        <form onSubmit={submit} className="mt-6 flex flex-col gap-3">
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            className="rounded-2xl border-2 border-slate-200 px-4 py-3 text-center font-display text-lg text-slate-700 outline-none focus:border-sky-400"
          />
          <input
            id="password"
            type="password"
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="rounded-2xl border-2 border-slate-200 px-4 py-3 text-center font-display text-lg text-slate-700 outline-none focus:border-sky-400"
          />
          <button
            type="submit"
            disabled={busy || email.trim().length === 0 || password.length < 6}
            className="btn-bounce rounded-full bg-sky-500 px-6 py-3 font-display text-lg font-bold text-white shadow-md disabled:bg-slate-300"
          >
            {busy
              ? "One sec…"
              : mode === "signup"
                ? "Create account"
                : "Sign in"}
          </button>
        </form>

        {error && <p className="mt-3 text-sm text-rose-500">{error}</p>}

        <button
          type="button"
          onClick={() => {
            setMode((m) => (m === "signin" ? "signup" : "signin"));
            setError(null);
          }}
          className="mt-5 text-sm font-display font-bold text-sky-500 hover:text-sky-600"
        >
          {mode === "signup"
            ? "Already have an account? Sign in"
            : "New here? Create an account"}
        </button>

        <p className="mt-3 text-xs text-slate-400">
          At least 6 characters. No email needed to sign in.
        </p>
      </div>
    </main>
  );
}
