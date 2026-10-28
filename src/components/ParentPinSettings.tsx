"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setParentPin } from "@/lib/pin-actions";

export function ParentPinSettings({ hasPin }: { hasPin: boolean }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [pin, setPin] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, start] = useTransition();

  function save() {
    start(async () => {
      const res = await setParentPin(pin);
      setMsg(res.message);
      if (res.ok) {
        setPin("");
        setEditing(false);
        router.refresh();
      }
    });
  }
  function remove() {
    if (!confirm("Remove the grown-up code? Anyone will be able to open this zone.")) return;
    start(async () => {
      const res = await setParentPin(null);
      setMsg(res.message);
      router.refresh();
    });
  }

  return (
    <div className="rounded-4xl bg-white p-4 shadow-md">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-display text-lg font-bold text-slate-700">🔒 Grown-up lock</p>
          <p className="text-sm text-slate-400">
            {hasPin ? "A 4-digit code is required to open this zone." : "No code set — this zone is open."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {msg && <span className="text-sm text-slate-400">{msg}</span>}
          {hasPin && (
            <button
              type="button"
              onClick={remove}
              disabled={busy}
              className="btn-bounce rounded-full bg-white px-4 py-2 font-display text-sm font-bold text-rose-500 shadow-sm ring-2 ring-rose-100"
            >
              Remove
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              setEditing((e) => !e);
              setMsg(null);
              setPin("");
            }}
            className="btn-bounce rounded-full bg-sky-500 px-4 py-2 font-display text-sm font-bold text-white shadow-sm"
          >
            {editing ? "Cancel" : hasPin ? "Change code" : "Set a code"}
          </button>
        </div>
      </div>

      {editing && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <input
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={4}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
            placeholder="4-digit code"
            className="w-40 rounded-2xl border-2 border-slate-200 px-4 py-2.5 text-center font-display text-xl tracking-widest text-slate-700 outline-none focus:border-sky-400"
          />
          <button
            type="button"
            onClick={save}
            disabled={busy || pin.length !== 4}
            className="btn-bounce rounded-full bg-sky-500 px-5 py-2.5 font-display font-bold text-white shadow-sm disabled:bg-slate-300"
          >
            Save
          </button>
        </div>
      )}
    </div>
  );
}
