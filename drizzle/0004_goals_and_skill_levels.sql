-- Savings goal (a prize the kid saves toward) and adaptive difficulty
-- (recommended level per game). Both additive and safe for older code.
ALTER TABLE "children" ADD COLUMN IF NOT EXISTS "goal_prize_id" text;
ALTER TABLE "children" ADD COLUMN IF NOT EXISTS "skill_levels" jsonb DEFAULT '{}'::jsonb NOT NULL;
