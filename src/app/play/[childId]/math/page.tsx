import { notFound } from "next/navigation";
import { getChild } from "@/lib/db";
import { startMathSession } from "@/lib/session";
import { MathGame } from "@/components/MathGame";

export const dynamic = "force-dynamic";

export default async function MathPage({
  params,
}: {
  params: Promise<{ childId: string }>;
}) {
  const { childId } = await params;
  const child = await getChild(childId);
  if (!child) notFound();

  const session = await startMathSession(child.id);
  if (!session) notFound();

  return (
    <main className="mx-auto flex min-h-full w-full max-w-2xl flex-col px-5 py-8">
      {/* key on sessionId so a fresh session always remounts the game cleanly */}
      <MathGame
        key={session.id}
        childId={child.id}
        childName={child.name}
        sessionId={session.id}
        questions={session.questions}
      />
    </main>
  );
}
