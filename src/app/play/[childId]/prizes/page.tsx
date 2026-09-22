import Link from "next/link";
import { notFound } from "next/navigation";
import { readDB, balanceOf } from "@/lib/db";
import { currentFamilyId } from "@/lib/family";
import { TokenBadge } from "@/components/TokenBadge";
import { PrizeCard } from "@/components/PrizeCard";
import { ClaimButton } from "@/components/ClaimButton";

export const dynamic = "force-dynamic";

export default async function PrizesPage({
  params,
}: {
  params: Promise<{ childId: string }>;
}) {
  const { childId } = await params;
  const db = await readDB(await currentFamilyId());
  const child = db.children.find((c) => c.id === childId);
  if (!child) notFound();

  const balance = balanceOf(db, child.id);
  const pendingPrizeIds = new Set(
    db.redemptions
      .filter((r) => r.childId === child.id && r.status === "pending")
      .map((r) => r.prizeId),
  );
  const prizes = db.prizes.filter((p) => p.active);

  // Prizes the child has won (approved) or already used (claimed).
  const won = db.redemptions
    .filter((r) => r.childId === child.id && (r.status === "approved" || r.status === "claimed"))
    .sort((a, b) => {
      if (a.status !== b.status) return a.status === "approved" ? -1 : 1;
      return b.createdAt.localeCompare(a.createdAt);
    })
    .map((r) => ({ redemption: r, prize: db.prizes.find((p) => p.id === r.prizeId) }));

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

      {/* My Prizes — what the child has won */}
      {won.length > 0 && (
        <section className="mt-6">
          <h2 className="text-center font-display text-2xl font-bold text-amber-600">
            🏆 My Prizes
          </h2>
          <ul className="mt-3 flex flex-col gap-3">
            {won.map(({ redemption, prize }) => (
              <li
                key={redemption.id}
                className={`flex flex-wrap items-center justify-between gap-3 rounded-4xl p-4 shadow-md ${
                  redemption.status === "approved" ? "bg-white ring-2 ring-amber-200" : "bg-white/70"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{prize?.emoji ?? "🎁"}</span>
                  <div>
                    <p className="font-display text-lg font-bold text-slate-700">
                      {prize?.name ?? "A prize"}
                    </p>
                    <p className="text-sm text-slate-400">
                      {redemption.status === "approved" ? "Ready to use! 🎉" : "Used ✓"}
                    </p>
                  </div>
                </div>
                {redemption.status === "approved" && (
                  <ClaimButton redemptionId={redemption.id} />
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      <h1 className="mt-8 text-center font-display text-4xl font-bold text-violet-600">
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
