"use client";

import { useState, useTransition } from "react";
import { resetTokens } from "@/lib/admin-actions";

export function ResetTokensButton() {
  const [confirming, setConfirming] = useState(false);
  const [done, setDone] = useState(false);
  const [pending, start] = useTransition();

  function doReset() {
    start(async () => {
      await resetTokens();
      setConfirming(false);
      setDone(true);
      setTimeout(() => setDone(false), 2500);
    });
  }

  if (confirming) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-display text-sm text-slate-500">
          Reset every kid&apos;s tokens to 0?
        </span>
        <button
          type="button"
          onClick={doReset}
          disabled={pending}
          className="btn-bounce rounded-full bg-rose-500 px-4 py-2 font-display text-sm font-bold text-white shadow-sm disabled:opacity-50"
        >
          {pending ? "Resetting…" : "Yes, reset"}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          disabled={pending}
          className="btn-bounce rounded-full bg-white px-4 py-2 font-display text-sm font-bold text-slate-500 shadow-sm ring-2 ring-slate-100"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className="btn-bounce rounded-full bg-white px-4 py-2 font-display text-sm font-bold text-rose-500 shadow-sm ring-2 ring-rose-100"
    >
      {done ? "✅ Tokens reset" : "↺ Reset all tokens"}
    </button>
  );
}
