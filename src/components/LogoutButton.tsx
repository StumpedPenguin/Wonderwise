"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { parentLogout } from "@/lib/auth-actions";

export function LogoutButton() {
  const router = useRouter();
  const [isSaving, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isSaving}
      onClick={() =>
        startTransition(async () => {
          await parentLogout();
          router.refresh();
        })
      }
      className="btn-bounce rounded-full bg-white/70 px-4 py-2 font-display text-slate-600 shadow-sm hover:bg-white"
    >
      🔒 Lock
    </button>
  );
}
