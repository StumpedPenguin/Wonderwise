import { NextResponse } from "next/server";
import { readDB } from "@/lib/db";

// Lightweight diagnostic endpoint. Visit /api/health to check whether the app
// can see DATABASE_URL and read from the database. Guaranteed to answer
// quickly even if the DB connection hangs, so it never burns a long timeout.
export const dynamic = "force-dynamic";
export const maxDuration = 20;

function timeoutAfter(ms: number): Promise<never> {
  return new Promise((_, reject) =>
    setTimeout(
      () =>
        reject(
          new Error(
            `TIMED_OUT after ${ms}ms — the database host accepted no reply. ` +
              `The connection is unreachable, wrong host/port, or blocked.`,
          ),
        ),
      ms,
    ),
  );
}

export async function GET() {
  const backend = process.env.DATABASE_URL ? "postgres" : "file";
  const started = Date.now();
  try {
    const db = await Promise.race([readDB(), timeoutAfter(12000)]);
    return NextResponse.json({
      ok: true,
      backend,
      children: db.children.length,
      prizes: db.prizes.length,
      ms: Date.now() - started,
    });
  } catch (e) {
    return NextResponse.json(
      {
        ok: false,
        backend,
        error: e instanceof Error ? e.message : String(e),
        ms: Date.now() - started,
      },
      { status: 500 },
    );
  }
}
