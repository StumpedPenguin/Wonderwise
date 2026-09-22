"use server";

import { revalidatePath } from "next/cache";
import { addContentItems, setContentStatus, deleteContent } from "./db";
import { isParentAuthed } from "./auth";
import { generateReadingBatch, aiConfigured } from "./ai";
import type { ContentItem } from "./types";

// ---------------------------------------------------------------------------
// Owner-only content generation. Every action re-checks the parent gate on the
// server, and the Anthropic key is read only here (server-side) — so no one
// but the grown-up can generate, and the key never reaches a browser.
// ---------------------------------------------------------------------------

export interface GenResult {
  ok: boolean;
  added: number;
  message: string;
}

export async function generateContent(count: number): Promise<GenResult> {
  if (!(await isParentAuthed())) {
    return { ok: false, added: 0, message: "Not allowed." };
  }
  if (!aiConfigured()) {
    return {
      ok: false,
      added: 0,
      message: "AI isn't set up yet — add an ANTHROPIC_API_KEY to enable it.",
    };
  }

  const n = Math.min(Math.max(1, Math.round(count) || 3), 5);
  try {
    const payloads = await generateReadingBatch(n);
    if (payloads.length === 0) {
      return { ok: false, added: 0, message: "No usable passages came back — try again." };
    }
    const items: ContentItem[] = payloads.map((payload) => ({
      id: crypto.randomUUID(),
      type: "reading",
      status: "pending",
      payload,
      createdAt: new Date().toISOString(),
    }));
    await addContentItems(items);
    revalidatePath("/parent/content");
    return { ok: true, added: items.length, message: `Generated ${items.length} for review.` };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Generation failed.";
    if (/does not exist|42P01/i.test(msg)) {
      return {
        ok: false,
        added: 0,
        message: "Database isn't ready — run the content_items migration (drizzle/0001) first.",
      };
    }
    return { ok: false, added: 0, message: msg };
  }
}

export async function approveContent(id: string): Promise<{ ok: boolean }> {
  if (!(await isParentAuthed())) return { ok: false };
  await setContentStatus(id, "approved");
  revalidatePath("/parent/content");
  return { ok: true };
}

export async function rejectContent(id: string): Promise<{ ok: boolean }> {
  if (!(await isParentAuthed())) return { ok: false };
  await setContentStatus(id, "rejected");
  revalidatePath("/parent/content");
  return { ok: true };
}

export async function removeContent(id: string): Promise<{ ok: boolean }> {
  if (!(await isParentAuthed())) return { ok: false };
  await deleteContent(id);
  revalidatePath("/parent/content");
  return { ok: true };
}
