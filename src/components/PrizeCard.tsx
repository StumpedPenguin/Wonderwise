"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { requestRedemption, setGoal } from "@/lib/actions";
import { TokenBadge } from "./TokenBadge";

export function PrizeCard({
  childId,
  prizeId,
  name,
  emoji,
  cost,
  balance,
  initiallyPending,
  isGoal,
}: {
  childId: string;
  prizeId: string;
  name: string;
  emoji: string;
  cost: number;
  balance: number;
  initiallyPending: boolean;
  isGoal: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(initiallyPending);
  const [message, setMessage] = useState<string | null>(null);
  const [isSaving, startTransition] = useTransition();
  const [goalBusy, startGoal] = useTransition();

  const canAfford = balance >= cost;

  function ask() {
    startTransition(async () => {
      const res = await requestRedemption(childId, prizeId);
      setMessage(res.message);
      if (res.ok) setPending(true);
    });
  }

  function toggleGoal() {
    startGoal(async () => {
      await setGoal(childId, isGoal ? null : prizeId);
      router.refresh();
    });
  }

  return (
    <div
      className={`relative flex flex-col items-center rounded-4xl bg-white p-5 text-center shadow-md ring-2 ${
        isGoal ? "ring-amber-300" : "ring-violet-50"
      }`}
    >
      <button
        type="button"
        onClick={toggleGoal}
        disabled={goalBusy}
        aria-label={isGoal ? "Remove savings goal" : "Save toward this prize"}
        title={isGoal ? "This is your goal" : "Make this my goal"}
        className="btn-bounce absolute right-3 top-3 text-2xl"
      >
        {isGoal ? "⭐" : "☆"}
      </button>
      <span className="text-6xl">{emoji}</span>
      <h3 className="mt-2 font-display text-xl font-bold text-slate-700">{name}</h3>
      <div className="mt-2">
        <TokenBadge amount={cost} size="sm" />
      </div>

      {pending ? (
        <p className="mt-4 rounded-full bg-amber-100 px-4 py-2 font-display text-amber-700">
          ⏳ Waiting for a grown-up
        </p>
      ) : (
        <button
          type="button"
          onClick={ask}
          disabled={isSaving || !canAfford}
          className={`btn-bounce mt-4 w-full rounded-full px-4 py-3 font-display text-lg font-bold text-white shadow-md ${
            canAfford ? "bg-violet-500" : "cursor-not-allowed bg-slate-300"
          }`}
        >
          {canAfford ? (isSaving ? "Asking…" : "Ask for this!") : `Need ${cost - balance} more`}
        </button>
      )}

      {message && !pending && (
        <p className="mt-2 text-sm text-rose-500">{message}</p>
      )}
      {message && pending && (
        <p className="mt-2 text-sm text-emerald-600">{message}</p>
      )}
    </div>
  );
}
