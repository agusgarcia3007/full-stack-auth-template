import { Resend } from "resend";
import { env } from "./env";

const resend = new Resend(env.RESEND_API_KEY);

export async function sendEmail(to: string, subject: string, body: string) {
  const { data, error } = await resend.emails.send({
    from: env.EMAIL_FROM,
    to,
    subject,
    html: body,
  });
  if (error) {
    console.error("Email send error:", error);
  }
  return data;
}
