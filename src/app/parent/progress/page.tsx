import Link from "next/link";
import { readDB } from "@/lib/db";
import { requireFamily } from "@/lib/family";
import { childStats, type ChildStats } from "@/lib/stats";
import { gradientFor } from "@/lib/theme";
import { TokenBadge } from "@/components/TokenBadge";

export const dynamic = "force-dynamic";

export default async function ProgressPage() {
  const db = await readDB(await requireFamily());

  return (
    <main className="mx-auto flex min-h-full w-full max-w-2xl flex-col px-5 py-8">
      <div className="flex items-center justify-between">
        <Link
          href="/parent"
          className="btn-bounce inline-flex items-center gap-1 rounded-full bg-white/70 px-4 py-2 font-display text-slate-600 shadow-sm hover:bg-white"
        >
          ← Grown-up zone
        </Link>
        <span className="font-display text-lg font-bold text-slate-500">Progress</span>
      </div>

      {db.children.length === 0 && (
        <p className="mt-8 rounded-4xl bg-white/70 px-5 py-10 text-center text-slate-400 shadow-sm">
          No kids yet — add one in the grown-up zone.
        </p>
      )}

      <div className="mt-6 flex flex-col gap-6">
        {db.children.map((child) => (
          <ChildCard
            key={child.id}
            name={child.name}
            avatar={child.avatar}
            color={child.color}
            stats={childStats(db, child.id)}
          />
        ))}
      </div>
    </main>
  );
}

function ChildCard({
  name,
  avatar,
  color,
  stats,
}: {
  name: string;
  avatar: string;
  color: string;
  stats: ChildStats;
}) {
  return (
    <section className="overflow-hidden rounded-4xl bg-white shadow-md">
      <div
        className={`flex items-center gap-3 bg-gradient-to-br ${gradientFor(color)} px-5 py-4 text-white`}
      >
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white/25 text-3xl shadow-inner">
          {avatar}
        </span>
        <div className="flex-1">
          <h2 className="font-display text-2xl font-bold">{name}</h2>
        </div>
        <TokenBadge amount={stats.balance} size="md" />
      </div>

      <div className="p-5">
        {/* Stat tiles */}
        <div className="grid grid-cols-3 gap-3">
          <Stat label="Earned" value={stats.totalEarned} tone="text-emerald-600" />
          <Stat label="Spent" value={stats.totalSpent} tone="text-rose-500" />
          <Stat label="Games played" value={stats.sessionsPlayed} tone="text-sky-600" />
        </div>

        {/* 7-day earned */}
        <h3 className="mt-6 font-display text-sm font-bold uppercase tracking-wide text-slate-400">
          Tokens earned · last 7 days
        </h3>
        <div className="mt-3 flex items-end justify-between gap-2" style={{ height: 96 }}>
          {stats.last7.map((d, i) => {
            const isToday = i === stats.last7.length - 1;
            const h = Math.round((d.earned / stats.maxEarned) * 72);
            return (
              <div key={i} className="flex flex-1 flex-col items-center justify-end gap-1">
                <span className="font-display text-xs font-bold tabular-nums text-slate-500">
                  {d.earned > 0 ? d.earned : ""}
                </span>
                <div
                  className={`w-full rounded-t-lg ${isToday ? "bg-amber-400" : "bg-amber-200"}`}
                  style={{ height: Math.max(d.earned > 0 ? 6 : 2, h) }}
                  title={`${d.label}: ${d.earned}`}
                />
                <span className="text-[11px] text-slate-400">{d.label}</span>
              </div>
            );
          })}
        </div>

        {/* Per-game */}
        {stats.perGame.length > 0 && (
          <>
            <h3 className="mt-6 font-display text-sm font-bold uppercase tracking-wide text-slate-400">
              Games played
            </h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {stats.perGame.map((g) => (
                <span
                  key={g.title}
                  className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1.5 text-sm text-slate-600 ring-1 ring-slate-100"
                >
                  <span>{g.emoji}</span>
                  {g.title}
                  <span className="font-display font-bold tabular-nums text-slate-400">×{g.count}</span>
                </span>
              ))}
            </div>
          </>
        )}

        {/* Recent activity */}
        {stats.recent.length > 0 && (
          <>
            <h3 className="mt-6 font-display text-sm font-bold uppercase tracking-wide text-slate-400">
              Recent
            </h3>
            <ul className="mt-2 flex flex-col divide-y divide-slate-100">
              {stats.recent.map((e, i) => (
                <li key={i} className="flex items-center justify-between py-2 text-sm">
                  <span className="text-slate-600">
                    <span className="text-slate-400">{e.day} · </span>
                    {e.reason}
                  </span>
                  <span
                    className={`font-display font-bold tabular-nums ${
                      e.delta > 0 ? "text-emerald-600" : "text-rose-500"
                    }`}
                  >
                    {e.delta > 0 ? "+" : ""}
                    {e.delta} 🪙
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}

        {stats.sessionsPlayed === 0 && stats.recent.length === 0 && (
          <p className="mt-4 rounded-2xl bg-slate-50 px-4 py-6 text-center text-slate-400">
            No activity yet — once {name} plays, it shows up here.
          </p>
        )}
      </div>
    </section>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 px-3 py-3 text-center">
      <div className={`font-display text-2xl font-bold tabular-nums ${tone}`}>{value}</div>
      <div className="text-xs text-slate-400">{label}</div>
    </div>
  );
}
