-- Per-kid game visibility. Additive and safe for older code: existing rows
-- backfill to an empty list (all games visible).
ALTER TABLE "children" ADD COLUMN IF NOT EXISTS "hidden_games" jsonb DEFAULT '[]'::jsonb NOT NULL;
