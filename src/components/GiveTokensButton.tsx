"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { giveTokens } from "@/lib/admin-actions";

export function GiveTokensButton({ childId, name }: { childId: string; name: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, start] = useTransition();

  function give(sign: 1 | -1) {
    const n = sign * Math.abs(parseInt(amount, 10) || 0);
    if (!n) {
      setMsg("Enter an amount.");
      return;
    }
    start(async () => {
      const res = await giveTokens(childId, n);
      setMsg(res.message);
      if (res.ok) {
        setAmount("");
        router.refresh();
      }
    });
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn-bounce rounded-full bg-white px-3 py-1.5 font-display text-sm font-bold text-emerald-600 shadow-sm ring-2 ring-emerald-100"
      >
        + Tokens
      </button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        inputMode="numeric"
        value={amount}
        onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
        placeholder={`for ${name}`}
        className="w-24 rounded-xl border-2 border-slate-200 px-3 py-1.5 text-center font-display text-slate-700 outline-none focus:border-emerald-400"
      />
      <button
        type="button"
        onClick={() => give(1)}
        disabled={busy}
        className="btn-bounce rounded-full bg-emerald-500 px-3 py-1.5 font-display text-sm font-bold text-white shadow-sm disabled:opacity-50"
      >
        Give
      </button>
      <button
        type="button"
        onClick={() => give(-1)}
        disabled={busy}
        className="btn-bounce rounded-full bg-white px-3 py-1.5 font-display text-sm font-bold text-rose-500 shadow-sm ring-2 ring-rose-100"
      >
        Take
      </button>
      <button
        type="button"
        onClick={() => {
          setOpen(false);
          setMsg(null);
          setAmount("");
        }}
        className="font-display text-sm text-slate-400"
      >
        Done
      </button>
      {msg && <span className="text-sm text-slate-400">{msg}</span>}
    </div>
  );
}
