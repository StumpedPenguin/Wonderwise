-- Seed data for a fresh Wonderwise database.
-- Apply after the migration, e.g. via the Supabase SQL editor or:
--   psql "$DATABASE_URL" -f drizzle/seed.sql
-- Safe to run more than once (ON CONFLICT DO NOTHING).

insert into families (id, name) values
  ('family-default', 'My Family')
on conflict (id) do nothing;

insert into children (id, name, avatar, color, math_max_sum) values
  ('child-fox', 'Fox', '🦊', 'sky', 5),
  ('child-penguin', 'Penguin', '🐧', 'violet', 10)
on conflict (id) do nothing;

insert into prizes (id, name, emoji, cost, active) values
  ('prize-screen', '30 min screen time', '🎮', 30, true),
  ('prize-dinner', 'Pick tonight''s dinner', '🍕', 50, true),
  ('prize-icecream', 'Ice cream trip', '🍦', 80, true),
  ('prize-trampoline', 'Trampoline park trip', '🤸', 200, true)
on conflict (id) do nothing;
