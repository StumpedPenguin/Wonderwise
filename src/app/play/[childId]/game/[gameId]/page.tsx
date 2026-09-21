import { notFound } from "next/navigation";
import Link from "next/link";
import { getChild } from "@/lib/db";
import { getGame } from "@/lib/games";
import { startSession } from "@/lib/session";
import { PlayGame } from "@/components/PlayGame";

export const dynamic = "force-dynamic";

export default async function GamePage({
  params,
}: {
  params: Promise<{ childId: string; gameId: string }>;
}) {
  const { childId, gameId } = await params;

  const child = await getChild(childId);
  const game = getGame(gameId);
  if (!child || !game) notFound();

  const session = await startSession(child.id, game.id);
  if (!session) notFound();

  return (
    <main className="mx-auto flex min-h-full w-full max-w-2xl flex-col px-5 py-6">
      <div className="flex items-center gap-2">
        <Link
          href={`/play/${child.id}`}
          className="btn-bounce inline-flex items-center gap-1 rounded-full bg-white/70 px-4 py-2 font-display text-slate-600 shadow-sm hover:bg-white"
        >
          ← Games
        </Link>
        <span className="font-display font-bold text-slate-500">
          {game.emoji} {game.title}
        </span>
      </div>

      {/* key on sessionId so a fresh session always remounts cleanly */}
      <PlayGame
        key={session.id}
        childId={child.id}
        childName={child.name}
        color={game.color}
        sessionId={session.id}
        questions={session.questions}
      />
    </main>
  );
}
