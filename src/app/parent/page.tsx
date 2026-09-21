import Link from "next/link";
import { readDB, balanceOf } from "@/lib/db";
import { TokenBadge } from "@/components/TokenBadge";
import { DecisionButtons } from "@/components/DecisionButtons";

export const dynamic = "force-dynamic";

export default async function ParentPage() {
  const db = await readDB();
  const childName = (id: string) =>
    db.children.find((c) => c.id === id)?.name ?? "A kid";
  const prizeById = (id: string) => db.prizes.find((p) => p.id === id);

  const pending = db.redemptions
    .filter((r) => r.status === "pending")
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

  return (
    <main className="mx-auto flex min-h-full w-full max-w-2xl flex-col px-5 py-8">
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="btn-bounce inline-flex items-center gap-1 rounded-full bg-white/70 px-4 py-2 font-display text-slate-600 shadow-sm hover:bg-white"
        >
          ← Home
        </Link>
        <span className="font-display text-lg font-bold text-slate-500">
          Grown-up zone
        </span>
      </div>

      {/* Prize requests to approve */}
      <section className="mt-6">
        <h1 className="font-display text-3xl font-bold text-sky-600">
          Prize requests
        </h1>
        {pending.length === 0 ? (
          <p className="mt-3 rounded-4xl bg-white/70 px-5 py-8 text-center text-slate-400 shadow-sm">
            No requests right now. 🎈
          </p>
        ) : (
          <ul className="mt-3 flex flex-col gap-3">
            {pending.map((r) => {
              const prize = prizeById(r.prizeId);
              const balance = balanceOf(db, r.childId);
              const affordable = prize ? balance >= prize.cost : false;
              return (
                <li
                  key={r.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-4xl bg-white p-4 shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{prize?.emoji ?? "🎁"}</span>
                    <div>
                      <p className="font-display text-lg font-bold text-slate-700">
                        {childName(r.childId)} wants {prize?.name ?? "a prize"}
                      </p>
                      <p className="text-sm text-slate-400">
                        Costs {prize?.cost ?? "?"} · has {balance}
                        {!affordable && (
                          <span className="ml-1 text-rose-400">· not enough yet</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <DecisionButtons redemptionId={r.id} />
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Wallets */}
      <section className="mt-8">
        <h2 className="font-display text-2xl font-bold text-slate-600">Wallets</h2>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {db.children.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between rounded-4xl bg-white p-4 shadow-md"
            >
              <span className="flex items-center gap-2 font-display text-lg font-bold text-slate-700">
                <span className="text-3xl">{c.avatar}</span>
                {c.name}
              </span>
              <TokenBadge amount={balanceOf(db, c.id)} size="sm" />
            </div>
          ))}
        </div>
      </section>

      {/* Prize catalog (read-only in this slice) */}
      <section className="mt-8">
        <h2 className="font-display text-2xl font-bold text-slate-600">
          Prize catalog
        </h2>
        <ul className="mt-3 flex flex-col gap-2">
          {db.prizes.map((p) => (
            <li
              key={p.id}
              className="flex items-center justify-between rounded-2xl bg-white/80 px-4 py-3 shadow-sm"
            >
              <span className="flex items-center gap-2 text-slate-600">
                <span className="text-2xl">{p.emoji}</span>
                {p.name}
              </span>
              <TokenBadge amount={p.cost} size="sm" />
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-8 rounded-2xl bg-white/60 px-4 py-3 text-center text-xs text-slate-400">
        Coming next: parent login, editing the prize catalog, progress
        dashboards, and owner-only AI content generation. This grown-up zone is
        open for now — real accounts arrive in the Foundations stage.
      </p>
    </main>
  );
}
