"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { unlockParent } from "@/lib/pin-actions";

export function ParentPinGate() {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [busy, start] = useTransition();

  function submit(value: string) {
    start(async () => {
      const res = await unlockParent(value);
      if (res.ok) router.refresh();
      else {
        setError(true);
        setPin("");
      }
    });
  }

  function tap(d: string) {
    if (busy) return;
    setError(false);
    const next = (pin + d).slice(0, 4);
    setPin(next);
    if (next.length === 4) submit(next);
  }

  return (
    <main className="mx-auto flex min-h-full w-full max-w-sm flex-col items-center justify-center px-5 py-16">
      <div className="w-full rounded-4xl bg-white px-8 py-10 text-center shadow-lg">
        <div className="text-5xl">🔒</div>
        <h1 className="mt-3 font-display text-2xl font-bold text-slate-700">Grown-ups only</h1>
        <p className="mt-1 text-slate-500">Enter the code</p>

        {/* PIN dots */}
        <div className="mt-6 flex justify-center gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <span
              key={i}
              className={`h-4 w-4 rounded-full ${
                i < pin.length ? "bg-sky-500" : "bg-slate-200"
              } ${error ? "bg-rose-300" : ""}`}
            />
          ))}
        </div>
        {error && <p className="mt-3 text-sm text-rose-500">Wrong code — try again</p>}

        {/* Keypad */}
        <div className="mx-auto mt-6 grid max-w-[240px] grid-cols-3 gap-3">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => tap(d)}
              disabled={busy}
              className="btn-bounce grid h-16 place-items-center rounded-2xl bg-slate-50 font-display text-2xl font-bold text-slate-700 shadow-sm ring-1 ring-slate-100"
            >
              {d}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setPin((p) => p.slice(0, -1))}
            disabled={busy}
            className="btn-bounce grid h-16 place-items-center rounded-2xl bg-white font-display text-xl text-slate-400 shadow-sm ring-1 ring-slate-100"
          >
            ⌫
          </button>
          <button
            type="button"
            onClick={() => tap("0")}
            disabled={busy}
            className="btn-bounce grid h-16 place-items-center rounded-2xl bg-slate-50 font-display text-2xl font-bold text-slate-700 shadow-sm ring-1 ring-slate-100"
          >
            0
          </button>
          <span />
        </div>

        <Link href="/" className="mt-6 inline-block text-sm text-slate-400 underline-offset-4 hover:underline">
          ← Back to kids
        </Link>
      </div>
    </main>
  );
}
