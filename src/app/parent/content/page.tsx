import Link from "next/link";
import { listContent } from "@/lib/db";
import { requireFamily } from "@/lib/family";
import { aiConfigured } from "@/lib/ai";
import { GenerateButton } from "@/components/GenerateButton";
import { ContentReviewButtons } from "@/components/ContentReviewButtons";
import type { ContentItem } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ContentStudio() {
  const familyId = await requireFamily();
  const [pending, approved] = await Promise.all([
    listContent(familyId, "pending"),
    listContent(familyId, "approved"),
  ]);

  return (
    <main className="mx-auto flex min-h-full w-full max-w-2xl flex-col px-5 py-8">
      <div className="flex items-center justify-between">
        <Link
          href="/parent"
          className="btn-bounce inline-flex items-center gap-1 rounded-full bg-white/70 px-4 py-2 font-display text-slate-600 shadow-sm hover:bg-white"
        >
          ← Grown-up zone
        </Link>
        <span className="font-display text-lg font-bold text-slate-500">Content Studio</span>
      </div>

      <section className="mt-6 rounded-4xl bg-white p-6 shadow-md">
        <h1 className="font-display text-2xl font-bold text-sky-600">
          ✨ Reading stories
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Generate short passages, review them, and approved ones show up in the
          kids' <strong>Read &amp; Answer</strong> game. Only you can generate here.
        </p>
        <div className="mt-4">
          {aiConfigured() ? (
            <GenerateButton />
          ) : (
            <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
              🔑 Add an <code className="rounded bg-amber-100 px-1">ANTHROPIC_API_KEY</code>{" "}
              in Vercel to turn on generation.
            </p>
          )}
        </div>
      </section>

      {/* Review queue */}
      <h2 className="mt-8 font-display text-2xl font-bold text-slate-600">
        To review {pending.length > 0 && <span className="text-slate-400">({pending.length})</span>}
      </h2>
      {pending.length === 0 ? (
        <p className="mt-3 rounded-4xl bg-white/70 px-5 py-8 text-center text-slate-400 shadow-sm">
          Nothing waiting. Generate some stories above. ✍️
        </p>
      ) : (
        <div className="mt-3 flex flex-col gap-4">
          {pending.map((item) => (
            <ContentCard key={item.id} item={item} />
          ))}
        </div>
      )}

      {/* Approved */}
      {approved.length > 0 && (
        <>
          <h2 className="mt-8 font-display text-2xl font-bold text-slate-600">
            Live for kids <span className="text-slate-400">({approved.length})</span>
          </h2>
          <ul className="mt-3 flex flex-col gap-2">
            {approved.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-3 rounded-2xl bg-white/80 px-4 py-3 shadow-sm"
              >
                <span className="min-w-0 truncate font-display font-bold text-slate-600">
                  {item.payload.title}
                </span>
                <ContentReviewButtons id={item.id} status="approved" />
              </li>
            ))}
          </ul>
        </>
      )}
    </main>
  );
}

function ContentCard({ item }: { item: ContentItem }) {
  return (
    <div className="rounded-4xl bg-white p-5 shadow-md">
      <h3 className="font-display text-xl font-bold text-slate-700">
        {item.payload.title}
      </h3>
      <p className="mt-2 font-display text-lg leading-relaxed text-slate-600">
        {item.payload.passage}
      </p>

      <ul className="mt-3 flex flex-col gap-2">
        {item.payload.questions.map((q, i) => (
          <li key={i} className="rounded-2xl bg-slate-50 px-4 py-3">
            <p className="font-display font-bold text-slate-700">{q.q}</p>
            <div className="mt-1 flex flex-wrap gap-2">
              {q.choices.map((c) => (
                <span
                  key={c}
                  className={`rounded-full px-3 py-1 text-sm ${
                    c === q.answer
                      ? "bg-emerald-100 font-bold text-emerald-700"
                      : "bg-white text-slate-500 ring-1 ring-slate-200"
                  }`}
                >
                  {c}
                  {c === q.answer && " ✓"}
                </span>
              ))}
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex justify-end">
        <ContentReviewButtons id={item.id} status="pending" />
      </div>
    </div>
  );
}
