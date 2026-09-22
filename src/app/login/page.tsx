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
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
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
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) setError(error.message);
      else setSent(true);
    } catch (err) {
      console.error("signInWithOtp failed", err);
      setError(err instanceof Error ? err.message : "Something went wrong — please try again.");
    }
    setBusy(false);
  }

  return (
    <main className="mx-auto flex min-h-full w-full max-w-sm flex-col items-center justify-center px-5 py-16">
      <div className="w-full rounded-4xl bg-white px-8 py-10 text-center shadow-lg">
        <div className="text-5xl">🌟</div>
        <h1 className="mt-2 font-display text-4xl font-bold text-sky-600">Wonderwise</h1>

        {sent ? (
          <>
            <div className="mt-6 text-5xl">📬</div>
            <h2 className="mt-3 font-display text-2xl font-bold text-slate-700">
              Check your email
            </h2>
            <p className="mt-2 text-slate-500">
              We sent a sign-in link to <strong>{email}</strong>. Tap it to sign in.
            </p>
          </>
        ) : (
          <>
            <p className="mt-2 text-slate-500">Grown-up sign in</p>
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
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="rounded-2xl border-2 border-slate-200 px-4 py-3 text-center font-display text-lg text-slate-700 outline-none focus:border-sky-400"
              />
              <button
                type="submit"
                disabled={busy || email.trim().length === 0}
                className="btn-bounce rounded-full bg-sky-500 px-6 py-3 font-display text-lg font-bold text-white shadow-md disabled:bg-slate-300"
              >
                {busy ? "Sending…" : "Email me a link"}
              </button>
            </form>
            {error && <p className="mt-3 text-sm text-rose-500">{error}</p>}
            <p className="mt-4 text-xs text-slate-400">
              We'll email you a magic link — no password needed.
            </p>
          </>
        )}
      </div>
    </main>
  );
}
