"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { generateContent } from "@/lib/content-actions";

export function GenerateButton() {
  const router = useRouter();
  const [msg, setMsg] = useState<string | null>(null);
  const [saving, start] = useTransition();

  function go() {
    setMsg(null);
    start(async () => {
      const res = await generateContent(3);
      setMsg(res.message);
      if (res.ok) router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={go}
        disabled={saving}
        className="btn-bounce rounded-full bg-sky-500 px-6 py-3 font-display text-lg font-bold text-white shadow-md disabled:opacity-60"
      >
        {saving ? "Writing…" : "✨ Generate 3 stories"}
      </button>
      {msg && <span className="text-sm text-slate-500">{msg}</span>}
    </div>
  );
}
