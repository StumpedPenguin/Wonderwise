import Link from "next/link";
import { notFound } from "next/navigation";
import { readDB, balanceOf } from "@/lib/db";
import { TokenBadge } from "@/components/TokenBadge";
import { PrizeCard } from "@/components/PrizeCard";

export const dynamic = "force-dynamic";

export default async function PrizesPage({
  params,
}: {
  params: Promise<{ childId: string }>;
}) {
  const { childId } = await params;
  const db = await readDB();
  const child = db.children.find((c) => c.id === childId);
  if (!child) notFound();

  const balance = balanceOf(db, child.id);
  const pendingPrizeIds = new Set(
    db.redemptions
      .filter((r) => r.childId === child.id && r.status === "pending")
      .map((r) => r.prizeId),
  );
  const prizes = db.prizes.filter((p) => p.active);

  return (
    <main className="mx-auto flex min-h-full w-full max-w-2xl flex-col px-5 py-8">
      <div className="flex items-center justify-between">
        <Link
          href={`/play/${child.id}`}
          className="btn-bounce inline-flex items-center gap-1 rounded-full bg-white/70 px-4 py-2 font-display text-slate-600 shadow-sm hover:bg-white"
        >
          ← Back
        </Link>
        <TokenBadge amount={balance} size="md" />
      </div>

      <h1 className="mt-6 text-center font-display text-4xl font-bold text-violet-600">
        🎁 Prize Shop
      </h1>
      <p className="mt-1 text-center text-slate-500">
        Ask a grown-up to say yes!
      </p>

      <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {prizes.map((prize) => (
          <PrizeCard
            key={prize.id}
            childId={child.id}
            prizeId={prize.id}
            name={prize.name}
            emoji={prize.emoji}
            cost={prize.cost}
            balance={balance}
            initiallyPending={pendingPrizeIds.has(prize.id)}
          />
        ))}
      </section>
    </main>
  );
}
