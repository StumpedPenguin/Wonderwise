"use server";

import { revalidatePath } from "next/cache";
import { transaction, getChild } from "./db";
import { currentFamilyId } from "./family";
import { computeAward, ACCURACY_GATE, nextLevel } from "./economy";
import { getGame } from "./games";
import { SPECIAL_REWARD, SPECIAL_REASON, periodStart } from "./lessons";
import { startSession } from "./session";
import type { Difficulty, Question } from "./types";

export interface StartResult {
  ok: boolean;
  sessionId: string;
  questions: Question[];
  /** The difficulty actually played (useful when "auto" resolved it). */
  level: Difficulty;
}

/**
 * Start a round from the client, so the game page stays a pure render and the
 * reward screen isn't remounted (and cleared) when a later action revalidates.
 * Difficulty "auto" resolves to the kid's adaptive level for this game.
 */
export async function startGame(
  childId: string,
  gameId: string,
  difficulty: Difficulty | "auto",
): Promise<StartResult> {
  const familyId = await currentFamilyId();
  let level: Difficulty;
  if (difficulty === "auto") {
    const child = await getChild(familyId, childId);
    level = child?.skillLevels?.[gameId] ?? "easy";
  } else {
    level = difficulty;
  }
  const session = await startSession(familyId, childId, gameId, level);
  if (!session) return { ok: false, sessionId: "", questions: [], level };
  return { ok: true, sessionId: session.id, questions: session.questions, level };
}

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
  passed: boolean;
  difficulty: Difficulty;
}

const emptyFinish: FinishResult = {
  ok: false,
  correct: 0,
  total: 0,
  tokens: 0,
  newBalance: 0,
  passed: false,
  difficulty: "easy",
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
  const familyId = await currentFamilyId();
  return transaction(familyId, async (tx) => {
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

    const difficulty: Difficulty = session.questions[0]?.difficulty ?? "easy";

    let tokens: number;
    let passed: boolean;

    if (game.special) {
      // Daily/Weekly: fixed reward, earnable once per period.
      const accuracy = total > 0 ? correct / total : 0;
      passed = accuracy >= ACCURACY_GATE;
      const already = await tx.hasLedgerSince(
        child.id,
        SPECIAL_REASON[game.special],
        periodStart(game.special),
      );
      tokens = passed && !already ? SPECIAL_REWARD[game.special] : 0;
      if (tokens > 0) {
        await tx.addLedger(child.id, tokens, SPECIAL_REASON[game.special]);
      }
    } else {
      const award = computeAward({ correct, total, difficulty });
      tokens = award.tokens;
      passed = award.passed;
      if (tokens > 0) {
        await tx.addLedger(child.id, tokens, `${game.title} · ${difficulty}`);
      }
      // Adaptive difficulty: nudge this game's recommended level by how it went.
      const recommended = nextLevel(difficulty, award.accuracy);
      if (child.skillLevels?.[session.gameId] !== recommended) {
        await tx.upsertChild({
          ...child,
          skillLevels: { ...child.skillLevels, [session.gameId]: recommended },
        });
      }
    }

    await tx.markSessionFinished(session.id);
    const newBalance = await tx.balance(child.id);

    revalidatePath(`/play/${child.id}`);

    return {
      ok: true,
      correct,
      total,
      tokens,
      newBalance,
      passed,
      difficulty,
    };
  });
}

/** A child picks (or clears) the prize they're saving toward. */
export async function setGoal(
  childId: string,
  prizeId: string | null,
): Promise<{ ok: boolean }> {
  const familyId = await currentFamilyId();
  return transaction(familyId, async (tx) => {
    const child = await tx.getChild(childId);
    if (!child) return { ok: false };
    await tx.upsertChild({ ...child, goalPrizeId: prizeId });
    revalidatePath(`/play/${childId}`);
    revalidatePath(`/play/${childId}/prizes`);
    return { ok: true };
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
  const familyId = await currentFamilyId();
  return transaction(familyId, async (tx) => {
    const child = await tx.getChild(childId);
    const prize = await tx.getPrize(prizeId);
    if (!child || !prize) return { ok: false, message: "Hmm, that prize is gone." };

    const already = await tx.findPendingRedemption(childId, prizeId);
    if (already) return { ok: false, message: "You already asked for this one!" };

    await tx.addRedemption({
      id: crypto.randomUUID(),
      familyId,
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

/** A child marks an approved prize as used in real life. */
export async function claimRedemption(
  redemptionId: string,
): Promise<{ ok: boolean }> {
  const familyId = await currentFamilyId();
  return transaction(familyId, async (tx) => {
    const r = await tx.getRedemption(redemptionId);
    if (!r || r.status !== "approved") return { ok: false };
    await tx.setRedemptionStatus(r.id, "claimed", new Date().toISOString());
    revalidatePath(`/play/${r.childId}/prizes`);
    return { ok: true };
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
  const familyId = await currentFamilyId();
  return transaction(familyId, async (tx) => {
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
