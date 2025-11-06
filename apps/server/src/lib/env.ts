import { z } from "zod";

export const envSchema = z.object({
  DATABASE_URL: z.string(),
  PORT: z.coerce.number().default(3000),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  RESEND_API_KEY: z.string(),
  CLIENT_URL: z.url(),
  EMAIL_FROM: z.email(),
});

export const env = envSchema.parse(process.env);
