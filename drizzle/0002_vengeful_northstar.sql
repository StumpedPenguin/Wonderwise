CREATE TABLE "families" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"owner_user_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "children" ADD COLUMN "family_id" text DEFAULT 'family-default' NOT NULL;--> statement-breakpoint
ALTER TABLE "content_items" ADD COLUMN "family_id" text DEFAULT 'family-default' NOT NULL;--> statement-breakpoint
ALTER TABLE "ledger" ADD COLUMN "family_id" text DEFAULT 'family-default' NOT NULL;--> statement-breakpoint
ALTER TABLE "prizes" ADD COLUMN "family_id" text DEFAULT 'family-default' NOT NULL;--> statement-breakpoint
ALTER TABLE "redemptions" ADD COLUMN "family_id" text DEFAULT 'family-default' NOT NULL;--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "family_id" text DEFAULT 'family-default' NOT NULL;