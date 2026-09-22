"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { claimRedemption } from "@/lib/actions";

export function ClaimButton({ redemptionId }: { redemptionId: string }) {
  const router = useRouter();
  const [saving, start] = useTransition();

  return (
    <button
      type="button"
      disabled={saving}
      onClick={() =>
        start(async () => {
          await claimRedemption(redemptionId);
          router.refresh();
        })
      }
      className="btn-bounce rounded-full bg-emerald-500 px-4 py-2 font-display font-bold text-white shadow-sm disabled:opacity-60"
    >
      I used it! ✅
    </button>
  );
}
