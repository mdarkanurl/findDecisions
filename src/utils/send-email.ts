

import { Resend } from 'resend';
import 'dotenv/config';
const RE_SEND_API_KEY = process.env.RE_SEND_API_KEY;
const resend = new Resend(RE_SEND_API_KEY);

export const sendEmail = async (user: {
    email: string,
    subject: string,
    html: string
}) => {
  const { data, error } = await resend.emails.send({
    from: 'Find Decisions <onboarding@resend.dev>',
    to: [user.email],
    subject: user.subject,
    html: user.html,
  });

  if (error) {
    return console.error(`Error from Resend: ${{ error }}`);
  }

  console.log({ data });
}