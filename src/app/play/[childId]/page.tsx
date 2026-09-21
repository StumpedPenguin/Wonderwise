import Link from "next/link";
import { notFound } from "next/navigation";
import { readDB, balanceOf } from "@/lib/db";
import { gradientFor } from "@/lib/theme";
import { TokenBadge } from "@/components/TokenBadge";

export const dynamic = "force-dynamic";

export default async function Dashboard({
  params,
}: {
  params: Promise<{ childId: string }>;
}) {
  const { childId } = await params;
  const db = await readDB();
  const child = db.children.find((c) => c.id === childId);
  if (!child) notFound();

  const balance = balanceOf(db, child.id);
  const pending = db.redemptions.filter(
    (r) => r.childId === child.id && r.status === "pending",
  ).length;

  return (
    <main className="mx-auto flex min-h-full w-full max-w-2xl flex-col px-5 py-8">
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="btn-bounce inline-flex items-center gap-1 rounded-full bg-white/70 px-4 py-2 font-display text-slate-600 shadow-sm hover:bg-white"
        >
          ← Switch
        </Link>
        <TokenBadge amount={balance} size="md" />
      </div>

      <section
        className={`mt-6 flex flex-col items-center rounded-4xl bg-gradient-to-br ${gradientFor(
          child.color,
        )} px-6 py-8 text-center text-white shadow-lg`}
      >
        <span className="grid h-24 w-24 place-items-center rounded-3xl bg-white/25 text-6xl shadow-inner">
          {child.avatar}
        </span>
        <h1 className="mt-3 font-display text-4xl font-bold">Hi, {child.name}!</h1>
        <p className="mt-1 text-white/90">You have</p>
        <div className="mt-2">
          <TokenBadge amount={balance} size="lg" />
        </div>
      </section>

      <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link
          href={`/play/${child.id}/math`}
          className="btn-bounce flex flex-col items-center gap-2 rounded-4xl bg-white p-8 text-center shadow-md ring-2 ring-sky-100 hover:ring-sky-300"
        >
          <span className="text-6xl">🔢</span>
          <span className="font-display text-2xl font-bold text-sky-600">Play Math</span>
          <span className="text-sm text-slate-500">Earn tokens!</span>
        </Link>
        <Link
          href={`/play/${child.id}/prizes`}
          className="btn-bounce relative flex flex-col items-center gap-2 rounded-4xl bg-white p-8 text-center shadow-md ring-2 ring-violet-100 hover:ring-violet-300"
        >
          <span className="text-6xl">🎁</span>
          <span className="font-display text-2xl font-bold text-violet-600">Prize Shop</span>
          <span className="text-sm text-slate-500">Spend your tokens</span>
          {pending > 0 && (
            <span className="absolute right-4 top-4 rounded-full bg-amber-400 px-2 py-0.5 text-xs font-bold text-white">
              {pending} waiting
            </span>
          )}
        </Link>
      </section>
    </main>
  );
}
