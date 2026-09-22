"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { approveContent, rejectContent, removeContent } from "@/lib/content-actions";

export function ContentReviewButtons({
  id,
  status,
}: {
  id: string;
  status: "pending" | "approved" | "rejected";
}) {
  const router = useRouter();
  const [saving, start] = useTransition();

  const run = (fn: (id: string) => Promise<unknown>) =>
    start(async () => {
      await fn(id);
      router.refresh();
    });

  if (status === "pending") {
    return (
      <div className="flex gap-2">
        <button
          type="button"
          disabled={saving}
          onClick={() => run(approveContent)}
          className="btn-bounce rounded-full bg-emerald-500 px-5 py-2 font-display font-bold text-white shadow-sm"
        >
          Approve
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={() => run(rejectContent)}
          className="btn-bounce rounded-full bg-white px-5 py-2 font-display font-bold text-slate-500 shadow-sm ring-2 ring-slate-100"
        >
          Reject
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      disabled={saving}
      onClick={() => run(removeContent)}
      className="btn-bounce rounded-full bg-white px-4 py-2 font-display text-sm text-rose-500 shadow-sm ring-2 ring-rose-100"
    >
      Delete
    </button>
  );
}
