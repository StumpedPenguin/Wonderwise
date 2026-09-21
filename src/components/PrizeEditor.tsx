"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { savePrize, deletePrize } from "@/lib/admin-actions";

interface PrizeData {
  id: string;
  name: string;
  emoji: string;
  cost: number;
  active: boolean;
}

export function PrizeEditor({ prizes }: { prizes: PrizeData[] }) {
  return (
    <div className="flex flex-col gap-3">
      {prizes.map((p) => (
        <PrizeRow key={p.id} prize={p} />
      ))}
      <PrizeRow />
    </div>
  );
}

function PrizeRow({ prize }: { prize?: PrizeData }) {
  const router = useRouter();
  const isNew = !prize;
  const [name, setName] = useState(prize?.name ?? "");
  const [emoji, setEmoji] = useState(prize?.emoji ?? "🎁");
  const [cost, setCost] = useState(String(prize?.cost ?? 50));
  const [active, setActive] = useState(prize?.active ?? true);
  const [msg, setMsg] = useState<string | null>(null);
  const [saving, start] = useTransition();

  function save() {
    setMsg(null);
    start(async () => {
      const res = await savePrize({
        id: prize?.id,
        name,
        emoji,
        cost: Number(cost),
        active,
      });
      setMsg(res.message);
      if (res.ok) {
        if (isNew) {
          setName("");
          setEmoji("🎁");
          setCost("50");
          setActive(true);
        }
        router.refresh();
      }
    });
  }

  function remove() {
    if (!prize) return;
    if (!confirm(`Remove "${prize.name}" from the prize shop?`)) return;
    start(async () => {
      await deletePrize(prize.id);
      router.refresh();
    });
  }

  return (
    <div className="rounded-4xl bg-white p-4 shadow-md">
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={emoji}
          onChange={(e) => setEmoji(e.target.value)}
          aria-label="Emoji"
          className="h-12 w-14 flex-none rounded-2xl border-2 border-slate-200 text-center text-2xl outline-none focus:border-violet-400"
        />
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={isNew ? "Add a prize…" : "Prize name"}
          className="min-w-0 flex-1 rounded-2xl border-2 border-slate-200 px-4 py-2.5 font-display text-lg text-slate-700 outline-none focus:border-violet-400"
        />
        <label className="flex items-center gap-1.5 rounded-2xl border-2 border-slate-200 px-3 py-2.5">
          <span aria-hidden>🪙</span>
          <input
            type="number"
            min={0}
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            aria-label="Token cost"
            className="w-16 text-center font-display text-lg tabular-nums text-slate-700 outline-none"
          />
        </label>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-500">
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="h-4 w-4 accent-violet-500"
          />
          Shown in shop
        </label>
        <div className="ml-auto flex items-center gap-2">
          {msg && <span className="text-sm text-slate-400">{msg}</span>}
          {!isNew && (
            <button
              type="button"
              onClick={remove}
              disabled={saving}
              className="btn-bounce rounded-full bg-white px-4 py-2 font-display text-rose-500 shadow-sm ring-2 ring-rose-100"
            >
              Delete
            </button>
          )}
          <button
            type="button"
            onClick={save}
            disabled={saving || !name.trim()}
            className="btn-bounce rounded-full bg-violet-500 px-5 py-2 font-display font-bold text-white shadow-sm disabled:bg-slate-300"
          >
            {isNew ? "Add" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
