import Link from "next/link";
import { notFound } from "next/navigation";
import { readDB, balanceOf } from "@/lib/db";
import { gradientFor, accentFor } from "@/lib/theme";
import { GAMES } from "@/lib/games";
import { TokenBadge } from "@/components/TokenBadge";

export const dynamic = "force-dynamic";

const subjectLabel: Record<string, string> = {
  math: "Numbers",
  reading: "Reading",
  writing: "Writing",
};

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
        )} px-6 py-7 text-center text-white shadow-lg`}
      >
        <span className="grid h-20 w-20 place-items-center rounded-3xl bg-white/25 text-5xl shadow-inner">
          {child.avatar}
        </span>
        <h1 className="mt-3 font-display text-3xl font-bold">Hi, {child.name}!</h1>
        <div className="mt-2">
          <TokenBadge amount={balance} size="lg" />
        </div>
      </section>

      <h2 className="mt-7 font-display text-2xl font-bold text-slate-600">
        Pick a game
      </h2>
      <section className="mt-3 grid grid-cols-2 gap-4">
        {GAMES.map((game) => {
          const accent = accentFor(game.color);
          return (
            <Link
              key={game.id}
              href={`/play/${child.id}/game/${game.id}`}
              className={`btn-bounce flex flex-col items-center gap-1 rounded-4xl bg-white p-6 text-center shadow-md ring-2 ${accent.ring} hover:brightness-105`}
            >
              <span className="text-5xl">{game.emoji}</span>
              <span className={`mt-1 font-display text-lg font-bold ${accent.text}`}>
                {game.title}
              </span>
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                {subjectLabel[game.subject]}
              </span>
            </Link>
          );
        })}
      </section>

      <Link
        href={`/play/${child.id}/prizes`}
        className="btn-bounce relative mt-4 flex items-center justify-center gap-3 rounded-4xl bg-gradient-to-r from-amber-400 to-orange-400 p-6 text-center text-white shadow-md"
      >
        <span className="text-4xl">🎁</span>
        <span className="font-display text-2xl font-bold">Prize Shop</span>
        {pending > 0 && (
          <span className="absolute right-4 top-4 rounded-full bg-white/90 px-2 py-0.5 text-xs font-bold text-orange-600">
            {pending} waiting
          </span>
        )}
      </Link>
    </main>
  );
}
