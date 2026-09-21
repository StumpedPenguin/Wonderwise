import { transaction } from "./db";
import { generateMathQuestions } from "./game";
import { QUESTIONS_PER_SESSION } from "./economy";
import type { GameSession } from "./types";

// Starts a new math session for a child: generates the questions on the
// SERVER and stores the answer key server-side, so awarding can be graded
// independently of anything the client sends back.
export async function startMathSession(childId: string): Promise<GameSession | null> {
  return transaction(async (tx) => {
    const child = await tx.getChild(childId);
    if (!child) return null;

    const session: GameSession = {
      id: crypto.randomUUID(),
      childId,
      gameId: "math-add-sub",
      questions: generateMathQuestions(child.mathMaxSum, QUESTIONS_PER_SESSION),
      startedAt: new Date().toISOString(),
    };

    await tx.addSession(session);
    return session;
  });
}
