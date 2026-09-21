"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { parentLogin } from "@/lib/auth-actions";

export function ParentLogin() {
  const router = useRouter();
  const [passcode, setPasscode] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isSaving, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await parentLogin(passcode);
      if (res.ok) {
        router.refresh();
      } else {
        setMessage(res.message);
        setPasscode("");
      }
    });
  }

  return (
    <div className="mx-auto mt-16 w-full max-w-sm rounded-4xl bg-white p-8 text-center shadow-lg">
      <div className="text-6xl">🔒</div>
      <h1 className="mt-3 font-display text-3xl font-bold text-slate-700">
        Grown-ups only
      </h1>
      <p className="mt-1 text-slate-500">Enter the family passcode.</p>

      <form onSubmit={submit} className="mt-6 flex flex-col gap-3">
        <input
          id="passcode"
          name="passcode"
          type="password"
          inputMode="numeric"
          autoComplete="off"
          value={passcode}
          onChange={(e) => setPasscode(e.target.value)}
          placeholder="Passcode"
          className="rounded-2xl border-2 border-slate-200 px-4 py-3 text-center font-display text-2xl tracking-widest text-slate-700 outline-none focus:border-sky-400"
        />
        <button
          type="submit"
          disabled={isSaving || passcode.length === 0}
          className="btn-bounce rounded-full bg-sky-500 px-6 py-3 font-display text-lg font-bold text-white shadow-md disabled:bg-slate-300"
        >
          {isSaving ? "Checking…" : "Unlock"}
        </button>
      </form>

      {message && <p className="mt-3 text-rose-500">{message}</p>}

      <Link href="/" className="mt-6 inline-block text-slate-400 hover:underline">
        ← Back to kids
      </Link>
    </div>
  );
}
