"use server";

import { revalidatePath } from "next/cache";
import { mutate, addLedger, balanceOf, earnedTodayOf } from "./db";
import { computeAward, nextMaxSum } from "./economy";

// ---------------------------------------------------------------------------
// Server actions — every state change the client can trigger goes through
// here, on the server. The client can ask for things; the server decides.
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

/**
 * Grade a finished session and award tokens. The client sends only which
 * choice it picked per question id; correctness is judged against the answer
 * key stored server-side when the session started.
 */
export async function finishSession(
  sessionId: string,
  responses: Record<string, number>,
): Promise<FinishResult> {
  return mutate((db) => {
    const session = db.sessions.find((s) => s.id === sessionId);
    if (!session || session.finishedAt) {
      return {
        ok: false,
        correct: 0,
        total: 0,
        tokens: 0,
        newBalance: 0,
        hitDailyCap: false,
        leveledUp: false,
      };
    }

    const child = db.children.find((c) => c.id === session.childId);
    if (!child) {
      return {
        ok: false,
        correct: 0,
        total: 0,
        tokens: 0,
        newBalance: 0,
        hitDailyCap: false,
        leveledUp: false,
      };
    }

    const total = session.questions.length;
    let correct = 0;
    for (const q of session.questions) {
      if (responses[q.id] === q.answer) correct++;
    }

    const award = computeAward({
      correct,
      total,
      maxSum: child.mathMaxSum,
      earnedToday: earnedTodayOf(db, child.id),
    });

    if (award.tokens > 0) {
      addLedger(db, child.id, award.tokens, "Math session");
    }

    // Adaptive difficulty.
    const newMax = nextMaxSum(child.mathMaxSum, award.accuracy);
    const leveledUp = newMax > child.mathMaxSum;
    child.mathMaxSum = newMax;

    session.finishedAt = new Date().toISOString();

    const newBalance = balanceOf(db, child.id);

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
  return mutate((db) => {
    const child = db.children.find((c) => c.id === childId);
    const prize = db.prizes.find((p) => p.id === prizeId);
    if (!child || !prize) return { ok: false, message: "Hmm, that prize is gone." };

    const already = db.redemptions.find(
      (r) => r.childId === childId && r.prizeId === prizeId && r.status === "pending",
    );
    if (already) return { ok: false, message: "You already asked for this one!" };

    db.redemptions.push({
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
  return mutate((db) => {
    const r = db.redemptions.find((x) => x.id === redemptionId);
    if (!r || r.status !== "pending") return { ok: false, message: "Already handled." };

    if (decision === "denied") {
      r.status = "denied";
      r.decidedAt = new Date().toISOString();
      revalidatePath("/parent");
      return { ok: true, message: "Denied." };
    }

    const prize = db.prizes.find((p) => p.id === r.prizeId);
    if (!prize) return { ok: false, message: "Prize no longer exists." };

    const balance = balanceOf(db, r.childId);
    if (balance < prize.cost) {
      return {
        ok: false,
        message: `Not enough tokens yet (${balance}/${prize.cost}). Left pending.`,
      };
    }

    addLedger(db, r.childId, -prize.cost, `Redeemed: ${prize.name}`);
    r.status = "approved";
    r.decidedAt = new Date().toISOString();

    revalidatePath("/parent");
    revalidatePath(`/play/${r.childId}`);
    return { ok: true, message: `Approved! ${prize.name} 🎉` };
  });
}
