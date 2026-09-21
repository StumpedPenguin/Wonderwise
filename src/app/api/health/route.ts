import { NextResponse } from "next/server";
import { readDB } from "@/lib/db";

// Lightweight diagnostic endpoint. Visit /api/health to check whether the app
// can see DATABASE_URL and read from the database.
export const dynamic = "force-dynamic";

export async function GET() {
  const usingPostgres = !!process.env.DATABASE_URL;
  try {
    const db = await readDB();
    return NextResponse.json({
      ok: true,
      backend: usingPostgres ? "postgres" : "file",
      children: db.children.length,
      prizes: db.prizes.length,
    });
  } catch (e) {
    return NextResponse.json(
      {
        ok: false,
        backend: usingPostgres ? "postgres" : "file",
        error: e instanceof Error ? e.message : String(e),
      },
      { status: 500 },
    );
  }
}
