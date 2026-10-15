-- Per-kid prize visibility. Additive and safe for older code: existing rows
-- backfill to an empty list (all prizes visible).
ALTER TABLE "children" ADD COLUMN IF NOT EXISTS "hidden_prizes" jsonb DEFAULT '[]'::jsonb NOT NULL;
