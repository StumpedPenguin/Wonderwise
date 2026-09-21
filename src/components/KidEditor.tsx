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
}

const AVATARS = ["🦊", "🐧", "🦁", "🐢", "🐼", "🐰", "🐸", "🦄", "🐙", "🐝", "🐨", "🦖"];
const COLORS = [
  { id: "sky", label: "Blue" },
  { id: "violet", label: "Purple" },
  { id: "teal", label: "Teal" },
  { id: "indigo", label: "Indigo" },
];

export function KidEditor({ kids }: { kids: KidData[] }) {
  return (
    <div className="flex flex-col gap-3">
      {kids.map((kid) => (
        <KidRow key={kid.id} kid={kid} />
      ))}
      <KidRow />
    </div>
  );
}

function KidRow({ kid }: { kid?: KidData }) {
  const router = useRouter();
  const isNew = !kid;
  const [name, setName] = useState(kid?.name ?? "");
  const [avatar, setAvatar] = useState(kid?.avatar ?? "🐣");
  const [color, setColor] = useState(kid?.color ?? "sky");
  const [msg, setMsg] = useState<string | null>(null);
  const [saving, start] = useTransition();

  function save() {
    setMsg(null);
    start(async () => {
      const res = await saveChild({ id: kid?.id, name, avatar, color });
      setMsg(res.message);
      if (res.ok) {
        if (isNew) {
          setName("");
          setAvatar("🐣");
          setColor("sky");
        }
        router.refresh();
      }
    });
  }

  function remove() {
    if (!kid) return;
    if (!confirm(`Remove ${kid.name}? This also clears their tokens and history.`)) return;
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
