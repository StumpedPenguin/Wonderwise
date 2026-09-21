import { mutate, getChild } from "./db";
import { generateMathQuestions } from "./game";
import { QUESTIONS_PER_SESSION } from "./economy";
import type { GameSession } from "./types";

// Starts a new math session for a child: generates the questions on the
// SERVER and stores the answer key server-side, so awarding can be graded
// independently of anything the client sends back.
export async function startMathSession(childId: string): Promise<GameSession | null> {
  const child = await getChild(childId);
  if (!child) return null;

  const session: GameSession = {
    id: crypto.randomUUID(),
    childId,
    gameId: "math-add-sub",
    questions: generateMathQuestions(child.mathMaxSum, QUESTIONS_PER_SESSION),
    startedAt: new Date().toISOString(),
  };

  await mutate((db) => {
    db.sessions.push(session);
    // Keep the store from growing without bound in this simple slice.
    if (db.sessions.length > 200) db.sessions.splice(0, db.sessions.length - 200);
  });

  return session;
}
