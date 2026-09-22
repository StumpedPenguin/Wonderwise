import Link from "next/link";
import { readDB, balanceOf } from "@/lib/db";
import { currentFamilyId } from "@/lib/family";
import type { DB } from "@/lib/types";
import { gradientFor } from "@/lib/theme";
import { TokenBadge } from "@/components/TokenBadge";

export const dynamic = "force-dynamic";

export default async function Home() {
  let db: DB | null = null;
  let loadError: string | null = null;
  try {
    db = await readDB(await currentFamilyId());
  } catch (e) {
    loadError = e instanceof Error ? e.message : String(e);
  }

  return (
    <main className="mx-auto flex min-h-full w-full max-w-3xl flex-col px-5 py-10">
      <header className="text-center">
        <h1 className="font-display text-5xl font-bold text-sky-600 drop-shadow-sm sm:text-6xl">
          Wonderwise
        </h1>
        <p className="mt-2 font-display text-2xl text-violet-500">Who's playing?</p>
      </header>

      {loadError || !db ? (
        <section className="mt-10 rounded-4xl bg-white p-8 text-center shadow-lg">
          <div className="text-5xl">🔌</div>
          <h2 className="mt-3 font-display text-2xl font-bold text-slate-700">
            Couldn't reach the database
          </h2>
          <p className="mt-2 text-slate-500">
            The app is running but can't load data yet. Check the connection at{" "}
            <Link href="/api/health" className="text-sky-600 underline">
              /api/health
            </Link>
            .
          </p>
          {loadError && (
            <pre className="mt-4 overflow-x-auto rounded-xl bg-slate-50 p-3 text-left text-xs text-rose-600">
              {loadError}
            </pre>
          )}
        </section>
      ) : (
        <section className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {db.children.map((child) => (
            <Link
              key={child.id}
              href={`/play/${child.id}`}
              className={`btn-bounce group flex items-center gap-5 rounded-4xl bg-gradient-to-br ${gradientFor(
                child.color,
              )} p-6 text-white shadow-lg`}
            >
              <span className="grid h-20 w-20 place-items-center rounded-3xl bg-white/25 text-5xl shadow-inner group-hover:animate-wiggle">
                {child.avatar}
              </span>
              <span className="flex flex-col">
                <span className="font-display text-3xl font-bold">{child.name}</span>
                <span className="mt-1">
                  <TokenBadge amount={balanceOf(db, child.id)} size="sm" />
                </span>
              </span>
            </Link>
          ))}
        </section>
      )}

      <div className="mt-auto pt-12 text-center">
        <Link
          href="/parent"
          className="btn-bounce inline-flex items-center gap-2 rounded-full bg-white/70 px-5 py-2.5 font-display text-slate-600 shadow-sm backdrop-blur hover:bg-white"
        >
          👋 Grown-ups
        </Link>
      </div>
    </main>
  );
}
