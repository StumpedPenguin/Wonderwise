"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { restoreChild, purgeChild } from "@/lib/admin-actions";

export interface RemovedKid {
  id: string;
  name: string;
  avatar: string;
}

export function RemovedKids({ kids }: { kids: RemovedKid[] }) {
  if (kids.length === 0) return null;
  return (
    <div className="flex flex-col gap-3">
      {kids.map((k) => (
        <RemovedRow key={k.id} kid={k} />
      ))}
    </div>
  );
}

function RemovedRow({ kid }: { kid: RemovedKid }) {
  const router = useRouter();
  const [busy, start] = useTransition();

  function restore() {
    start(async () => {
      await restoreChild(kid.id);
      router.refresh();
    });
  }
  function forever() {
    if (!confirm(`Delete ${kid.name} FOREVER? This can't be undone — tokens and history are erased.`)) return;
    start(async () => {
      await purgeChild(kid.id);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-4xl bg-white/70 p-4 shadow-sm ring-1 ring-slate-100">
      <span className="flex items-center gap-2 font-display text-lg font-bold text-slate-500">
        <span className="text-3xl grayscale">{kid.avatar}</span>
        {kid.name}
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={restore}
          disabled={busy}
          className="btn-bounce rounded-full bg-emerald-500 px-5 py-2 font-display font-bold text-white shadow-sm disabled:opacity-50"
        >
          ↩︎ Restore
        </button>
        <button
          type="button"
          onClick={forever}
          disabled={busy}
          className="btn-bounce rounded-full bg-white px-4 py-2 font-display text-sm font-bold text-rose-500 shadow-sm ring-2 ring-rose-100"
        >
          Delete forever
        </button>
      </div>
    </div>
  );
}
