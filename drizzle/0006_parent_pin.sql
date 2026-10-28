-- Optional PIN that locks the grown-up zone. Additive and safe: existing
-- families get NULL (no lock).
ALTER TABLE "families" ADD COLUMN IF NOT EXISTS "parent_pin" text;
