

import { Resend } from 'resend';
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
    return console.error({ error });
  }

  console.log({ data });
}