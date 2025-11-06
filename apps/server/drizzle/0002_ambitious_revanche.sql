DROP INDEX "tokens_expires_at_idx";--> statement-breakpoint
CREATE INDEX "tokens_token_idx" ON "tokens" USING btree ("token");--> statement-breakpoint
CREATE INDEX "tokens_expires_at_revoked_idx" ON "tokens" USING btree ("expires_at","revoked");--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "users" USING btree ("email");