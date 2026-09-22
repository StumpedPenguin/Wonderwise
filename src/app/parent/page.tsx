import Link from "next/link";
import { readDB, balanceOf } from "@/lib/db";
import { requireFamily, authConfigured } from "@/lib/family";
import { TokenBadge } from "@/components/TokenBadge";
import { DecisionButtons } from "@/components/DecisionButtons";
import { SignOutButton } from "@/components/SignOutButton";
import { KidEditor } from "@/components/KidEditor";
import { PrizeEditor } from "@/components/PrizeEditor";

export const dynamic = "force-dynamic";

export default async function ParentPage() {
  const familyId = await requireFamily();
  const signedIn = authConfigured();
  const db = await readDB(familyId);
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
        {signedIn ? (
          <SignOutButton />
        ) : (
          <span className="font-display text-lg font-bold text-slate-500">
            Grown-up zone
          </span>
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Link
          href="/parent/progress"
          className="btn-bounce flex items-center justify-center gap-2 rounded-4xl bg-gradient-to-r from-sky-400 to-indigo-400 p-4 font-display text-lg font-bold text-white shadow-md"
        >
          📊 See progress
        </Link>
        <Link
          href="/parent/content"
          className="btn-bounce flex items-center justify-center gap-2 rounded-4xl bg-gradient-to-r from-violet-400 to-fuchsia-400 p-4 font-display text-lg font-bold text-white shadow-md"
        >
          ✨ Content Studio
        </Link>
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

      {/* Kids */}
      <section className="mt-8">
        <h2 className="font-display text-2xl font-bold text-slate-600">Kids</h2>
        <p className="mt-1 text-sm text-slate-400">
          Rename, pick an avatar and color, add or remove.
        </p>
        <div className="mt-3">
          <KidEditor
            kids={db.children.map((c) => ({
              id: c.id,
              name: c.name,
              avatar: c.avatar,
              color: c.color,
            }))}
          />
        </div>
      </section>

      {/* Prize catalog (editable) */}
      <section className="mt-8">
        <h2 className="font-display text-2xl font-bold text-slate-600">
          Prize catalog
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Set your real prizes and their token costs.
        </p>
        <div className="mt-3">
          <PrizeEditor
            prizes={db.prizes.map((p) => ({
              id: p.id,
              name: p.name,
              emoji: p.emoji,
              cost: p.cost,
              active: p.active,
            }))}
          />
        </div>
      </section>

    </main>
  );
}
