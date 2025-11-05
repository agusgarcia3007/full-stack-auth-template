CREATE TYPE "public"."token_type" AS ENUM('access', 'refresh', 'password_reset', 'email_verification', 'email_change');--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'student'::text;--> statement-breakpoint
DROP TYPE "public"."user_role";--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'student');--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'student'::"public"."user_role";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DATA TYPE "public"."user_role" USING "role"::"public"."user_role";--> statement-breakpoint
ALTER TABLE "tokens" ALTER COLUMN "type" SET DATA TYPE "public"."token_type" USING "type"::"public"."token_type";--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "email_verified" boolean DEFAULT false NOT NULL;--> statement-breakpoint
CREATE INDEX "tokens_user_id_type_revoked_idx" ON "tokens" USING btree ("user_id","type","revoked");--> statement-breakpoint
CREATE INDEX "tokens_expires_at_idx" ON "tokens" USING btree ("expires_at");