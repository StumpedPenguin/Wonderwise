"use server";

import { revalidatePath } from "next/cache";
import { transaction } from "./db";
import { computeAward } from "./economy";
import { getGame } from "./games";

// ---------------------------------------------------------------------------
// Server actions — every state change the client can trigger goes through
// here, on the server. The client can ask for things; the server decides.
// Each action runs inside a single atomic transaction.
// ---------------------------------------------------------------------------

export interface FinishResult {
  ok: boolean;
  correct: number;
  total: number;
  tokens: number;
  newBalance: number;
  hitDailyCap: boolean;
  leveledUp: boolean;
}

const emptyFinish: FinishResult = {
  ok: false,
  correct: 0,
  total: 0,
  tokens: 0,
  newBalance: 0,
  hitDailyCap: false,
  leveledUp: false,
};

/**
 * Grade a finished session and award tokens. The client sends only which
 * choice it picked per question id; correctness is judged against the answer
 * key stored server-side when the session started.
 */
export async function finishSession(
  sessionId: string,
  responses: Record<string, string>,
): Promise<FinishResult> {
  return transaction(async (tx) => {
    const session = await tx.getSession(sessionId);
    if (!session || session.finishedAt) return emptyFinish;

    const child = await tx.getChild(session.childId);
    if (!child) return emptyFinish;

    const game = getGame(session.gameId);
    if (!game) return emptyFinish;

    const total = session.questions.length;
    let correct = 0;
    for (const q of session.questions) {
      if (responses[q.id] === q.answer) correct++;
    }

    const earnedToday = await tx.earnedToday(child.id);
    const award = computeAward({
      correct,
      total,
      weight: game.weight(child),
      earnedToday,
    });

    if (award.tokens > 0) {
      await tx.addLedger(child.id, award.tokens, `${game.title} session`);
    }

    // Adaptive difficulty (per game).
    const updates = game.adapt(child, award.accuracy);
    const leveledUp =
      updates.mathMaxSum !== undefined && updates.mathMaxSum > child.mathMaxSum;
    if (
      updates.mathMaxSum !== undefined &&
      updates.mathMaxSum !== child.mathMaxSum
    ) {
      await tx.setChildMaxSum(child.id, updates.mathMaxSum);
    }

    await tx.markSessionFinished(session.id);
    const newBalance = await tx.balance(child.id);

    revalidatePath(`/play/${child.id}`);

    return {
      ok: true,
      correct,
      total,
      tokens: award.tokens,
      newBalance,
      hitDailyCap: award.hitDailyCap,
      leveledUp,
    };
  });
}

export interface RedeemResult {
  ok: boolean;
  message: string;
}

/** A child asks for a prize. Creates a pending request for a grown-up. */
export async function requestRedemption(
  childId: string,
  prizeId: string,
): Promise<RedeemResult> {
  return transaction(async (tx) => {
    const child = await tx.getChild(childId);
    const prize = await tx.getPrize(prizeId);
    if (!child || !prize) return { ok: false, message: "Hmm, that prize is gone." };

    const already = await tx.findPendingRedemption(childId, prizeId);
    if (already) return { ok: false, message: "You already asked for this one!" };

    await tx.addRedemption({
      id: crypto.randomUUID(),
      childId,
      prizeId,
      status: "pending",
      createdAt: new Date().toISOString(),
    });

    revalidatePath(`/play/${childId}/prizes`);
    revalidatePath("/parent");
    return { ok: true, message: "Sent! Ask a grown-up to say yes. 🎉" };
  });
}

export interface DecisionResult {
  ok: boolean;
  message: string;
}

/** A grown-up approves or denies a request. Approving spends the tokens. */
export async function decideRedemption(
  redemptionId: string,
  decision: "approved" | "denied",
): Promise<DecisionResult> {
  return transaction(async (tx) => {
    const r = await tx.getRedemption(redemptionId);
    if (!r || r.status !== "pending") return { ok: false, message: "Already handled." };

    const now = new Date().toISOString();

    if (decision === "denied") {
      await tx.setRedemptionStatus(r.id, "denied", now);
      revalidatePath("/parent");
      return { ok: true, message: "Denied." };
    }

    const prize = await tx.getPrize(r.prizeId);
    if (!prize) return { ok: false, message: "Prize no longer exists." };

    const balance = await tx.balance(r.childId);
    if (balance < prize.cost) {
      return {
        ok: false,
        message: `Not enough tokens yet (${balance}/${prize.cost}). Left pending.`,
      };
    }

    await tx.addLedger(r.childId, -prize.cost, `Redeemed: ${prize.name}`);
    await tx.setRedemptionStatus(r.id, "approved", now);

    revalidatePath("/parent");
    revalidatePath(`/play/${r.childId}`);
    return { ok: true, message: `Approved! ${prize.name} 🎉` };
  });
}
