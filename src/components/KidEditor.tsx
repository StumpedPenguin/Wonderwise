"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveChild, deleteChild } from "@/lib/admin-actions";
import { gradientFor } from "@/lib/theme";

interface KidData {
  id: string;
  name: string;
  avatar: string;
  color: string;
  hiddenGames: string[];
  hiddenPrizes: string[];
}

export interface GameInfo {
  id: string;
  title: string;
  emoji: string;
}

export interface PrizeInfo {
  id: string;
  name: string;
  emoji: string;
}

const AVATARS = ["🦊", "🐧", "🦁", "🐢", "🐼", "🐰", "🐸", "🦄", "🐙", "🐝", "🐨", "🦖"];
const COLORS = [
  { id: "sky", label: "Blue" },
  { id: "violet", label: "Purple" },
  { id: "teal", label: "Teal" },
  { id: "indigo", label: "Indigo" },
];

export function KidEditor({
  kids,
  allGames,
  allPrizes,
}: {
  kids: KidData[];
  allGames: GameInfo[];
  allPrizes: PrizeInfo[];
}) {
  return (
    <div className="flex flex-col gap-3">
      {kids.map((kid) => (
        <KidRow key={kid.id} kid={kid} allGames={allGames} allPrizes={allPrizes} />
      ))}
      <KidRow allGames={allGames} allPrizes={allPrizes} />
    </div>
  );
}

function KidRow({
  kid,
  allGames,
  allPrizes,
}: {
  kid?: KidData;
  allGames: GameInfo[];
  allPrizes: PrizeInfo[];
}) {
  const router = useRouter();
  const isNew = !kid;
  const [name, setName] = useState(kid?.name ?? "");
  const [avatar, setAvatar] = useState(kid?.avatar ?? "🐣");
  const [color, setColor] = useState(kid?.color ?? "sky");
  const [hidden, setHidden] = useState<string[]>(kid?.hiddenGames ?? []);
  const [hiddenPrizes, setHiddenPrizes] = useState<string[]>(kid?.hiddenPrizes ?? []);
  const [showGames, setShowGames] = useState(false);
  const [showPrizes, setShowPrizes] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [saving, start] = useTransition();

  const isHidden = (id: string) => hidden.includes(id);
  function toggleGame(id: string) {
    setHidden((h) => (h.includes(id) ? h.filter((x) => x !== id) : [...h, id]));
  }
  const isPrizeHidden = (id: string) => hiddenPrizes.includes(id);
  function togglePrize(id: string) {
    setHiddenPrizes((h) => (h.includes(id) ? h.filter((x) => x !== id) : [...h, id]));
  }

  function save() {
    setMsg(null);
    start(async () => {
      const res = await saveChild({ id: kid?.id, name, avatar, color, hiddenGames: hidden, hiddenPrizes });
      setMsg(res.message);
      if (res.ok) {
        if (isNew) {
          setName("");
          setAvatar("🐣");
          setColor("sky");
          setHidden([]);
          setHiddenPrizes([]);
          setShowGames(false);
          setShowPrizes(false);
        }
        router.refresh();
      }
    });
  }

  function remove() {
    if (!kid) return;
    if (!confirm(`Remove ${kid.name}? You can restore them later from "Recently removed".`)) return;
    start(async () => {
      await deleteChild(kid.id);
      router.refresh();
    });
  }

  return (
    <div className="rounded-4xl bg-white p-4 shadow-md">
      <div className="flex items-center gap-3">
        <span
          className={`grid h-14 w-14 flex-none place-items-center rounded-2xl bg-gradient-to-br ${gradientFor(
            color,
          )} text-3xl shadow-inner`}
        >
          {avatar}
        </span>
        <input
          id={`kid-name-${kid?.id ?? "new"}`}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={isNew ? "Add a kid…" : "Name"}
          className="min-w-0 flex-1 rounded-2xl border-2 border-slate-200 px-4 py-2.5 font-display text-lg text-slate-700 outline-none focus:border-sky-400"
        />
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {AVATARS.map((a) => (
          <button
            key={a}
            type="button"
            onClick={() => setAvatar(a)}
            className={`btn-bounce grid h-9 w-9 place-items-center rounded-xl text-xl ${
              avatar === a ? "bg-sky-100 ring-2 ring-sky-300" : "bg-slate-50"
            }`}
          >
            {a}
          </button>
        ))}
      </div>

      {/* Per-kid game visibility */}
      {!isNew && (
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setShowGames((s) => !s)}
            className="font-display text-sm font-bold text-sky-500 hover:text-sky-600"
          >
            {showGames ? "▾ " : "▸ "}
            Games {hidden.length > 0 && <span className="text-slate-400">({hidden.length} hidden)</span>}
          </button>
          {showGames && (
            <div className="mt-2 flex flex-wrap gap-2">
              {allGames.map((g) => {
                const off = isHidden(g.id);
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => toggleGame(g.id)}
                    className={`btn-bounce inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-display text-sm shadow-sm ${
                      off
                        ? "bg-slate-100 text-slate-400 line-through ring-1 ring-slate-200"
                        : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                    }`}
                    title={off ? "Hidden — tap to show" : "Shown — tap to hide"}
                  >
                    <span>{g.emoji}</span>
                    {g.title}
                    <span>{off ? "🚫" : "✓"}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Per-kid prize visibility */}
      {!isNew && allPrizes.length > 0 && (
        <div className="mt-2">
          <button
            type="button"
            onClick={() => setShowPrizes((s) => !s)}
            className="font-display text-sm font-bold text-sky-500 hover:text-sky-600"
          >
            {showPrizes ? "▾ " : "▸ "}
            Prizes{" "}
            {hiddenPrizes.length > 0 && (
              <span className="text-slate-400">({hiddenPrizes.length} hidden)</span>
            )}
          </button>
          {showPrizes && (
            <div className="mt-2 flex flex-wrap gap-2">
              {allPrizes.map((p) => {
                const off = isPrizeHidden(p.id);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => togglePrize(p.id)}
                    className={`btn-bounce inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-display text-sm shadow-sm ${
                      off
                        ? "bg-slate-100 text-slate-400 line-through ring-1 ring-slate-200"
                        : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                    }`}
                    title={off ? "Hidden — tap to show" : "Shown — tap to hide"}
                  >
                    <span>{p.emoji}</span>
                    {p.name}
                    <span>{off ? "🚫" : "✓"}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {COLORS.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setColor(c.id)}
            className={`btn-bounce h-8 w-8 rounded-full bg-gradient-to-br ${gradientFor(
              c.id,
            )} ${color === c.id ? "ring-2 ring-slate-400 ring-offset-2" : ""}`}
            aria-label={c.label}
            title={c.label}
          />
        ))}
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
            className="btn-bounce rounded-full bg-sky-500 px-5 py-2 font-display font-bold text-white shadow-sm disabled:bg-slate-300"
          >
            {isNew ? "Add" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
