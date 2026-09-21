import type { Config } from "drizzle-kit";

// Used by `drizzle-kit` to generate and apply SQL migrations.
// DATABASE_URL is only needed for `db:migrate` (applying to a live database);
// `db:generate` produces SQL from the schema without any connection.
export default {
  schema: "./src/lib/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "postgres://localhost:5432/placeholder",
  },
} satisfies Config;
