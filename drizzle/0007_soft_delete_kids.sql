-- Soft-delete for kids: removing a kid now just sets deleted_at, so they (and
-- their tokens/history) can be restored. Additive and safe (NULL = active).
ALTER TABLE "children" ADD COLUMN IF NOT EXISTS "deleted_at" timestamptz;
