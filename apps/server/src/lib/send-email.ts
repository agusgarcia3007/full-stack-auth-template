import { Resend } from "resend";
import { env } from "./env";
import { logger } from "./logger";

const resend = new Resend(env.RESEND_API_KEY);

export async function sendEmail(to: string, subject: string, body: string) {
  const { data, error } = await resend.emails.send({
    from: "reely <noreply@reely.com>",
    to,
    subject,
    html: body,
  });
  if (error) {
    logger.error(error.message);
  }
  return data;
}
