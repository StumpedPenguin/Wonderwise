"use client";

import { useState, useTransition } from "react";
import { decideRedemption } from "@/lib/actions";

export function DecisionButtons({ redemptionId }: { redemptionId: string }) {
  const [message, setMessage] = useState<string | null>(null);
  const [isSaving, startTransition] = useTransition();

  function decide(decision: "approved" | "denied") {
    startTransition(async () => {
      const res = await decideRedemption(redemptionId, decision);
      setMessage(res.message);
    });
  }

  if (message) {
    return <p className="font-display text-sm text-slate-500">{message}</p>;
  }

  return (
    <div className="flex gap-2">
      <button
        type="button"
        disabled={isSaving}
        onClick={() => decide("approved")}
        className="btn-bounce rounded-full bg-emerald-500 px-5 py-2 font-display font-bold text-white shadow-sm"
      >
        Approve
      </button>
      <button
        type="button"
        disabled={isSaving}
        onClick={() => decide("denied")}
        className="btn-bounce rounded-full bg-white px-5 py-2 font-display font-bold text-slate-500 shadow-sm ring-2 ring-slate-100"
      >
        Deny
      </button>
    </div>
  );
}
