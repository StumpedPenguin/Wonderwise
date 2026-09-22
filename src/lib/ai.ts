import Anthropic from "@anthropic-ai/sdk";
import type { ReadingPayload } from "./types";

// Server-only: generates short, kid-safe reading passages with Claude.
// The API key is read from ANTHROPIC_API_KEY and never sent to the browser.

export function aiConfigured(): boolean {
  return !!process.env.ANTHROPIC_API_KEY;
}

function extractJsonArray(text: string): string {
  const start = text.indexOf("[");
  const end = text.lastIndexOf("]");
  if (start === -1 || end === -1 || end < start) {
    throw new Error("The model did not return a JSON array.");
  }
  return text.slice(start, end + 1);
}

function isValid(p: unknown): p is ReadingPayload {
  if (!p || typeof p !== "object") return false;
  const r = p as ReadingPayload;
  if (typeof r.title !== "string" || typeof r.passage !== "string") return false;
  if (!Array.isArray(r.questions) || r.questions.length === 0) return false;
  return r.questions.every(
    (q) =>
      q &&
      typeof q.q === "string" &&
      Array.isArray(q.choices) &&
      q.choices.length >= 2 &&
      typeof q.answer === "string" &&
      q.choices.includes(q.answer),
  );
}

export async function generateReadingBatch(count: number): Promise<ReadingPayload[]> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not set");
  }
  const client = new Anthropic();

  const prompt = `Write ${count} very short reading passages for children ages 5 to 7 who are learning to read.

Rules:
- Each passage is 2 to 4 short, simple sentences using common words.
- Cheerful, gentle, wholesome themes only (animals, family, nature, play, food). Absolutely nothing scary, violent, sad, unsafe, or grown-up.
- Give each passage a short title (2 to 4 words).
- Write exactly 2 comprehension questions per passage. Each question has exactly 3 answer choices, and exactly one is correct. The correct answer's text must be answerable from the passage and must appear verbatim in that question's choices.

Return ONLY a JSON array (no preamble, no code fences), shaped exactly like:
[{"title":"The Little Cat","passage":"...","questions":[{"q":"...","choices":["...","...","..."],"answer":"..."},{"q":"...","choices":["...","...","..."],"answer":"..."}]}]`;

  const message = await client.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 3000,
    messages: [{ role: "user", content: prompt }],
  });

  const text = message.content
    .map((b) => (b.type === "text" ? b.text : ""))
    .join("");

  const parsed = JSON.parse(extractJsonArray(text)) as unknown[];
  return parsed.filter(isValid);
}
