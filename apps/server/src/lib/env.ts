import { z } from "zod";

export const envSchema = z.object({
  DATABASE_URL: z.string(),
  PORT: z.string(),
  JWT_SECRET: z.string(),
  RESEND_API_KEY: z.string(),
  CLIENT_URL: z.string(),
});

export const env = envSchema.parse(process.env);
