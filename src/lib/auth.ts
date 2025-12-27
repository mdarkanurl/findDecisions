import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { PrismaService } from "../prisma/prisma.service";
import 'dotenv/config';
import { sendEmailQueue } from '../utils/rabbitmq';

const Prisma = new PrismaService();

export const auth = betterAuth({
  url: process.env.BETTER_AUTH_URL!,
  secret: process.env.BETTER_AUTH_SECRET!,
  database: prismaAdapter(Prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true
  },
  emailVerification: {
    async sendVerificationEmail({ user, url, token }, request) {
      await sendEmailQueue({
        email: user.email,
        subject: 'Verify your email address',
        body: `Click the link to verify your email: ${url}`,
      });
    },
    autoSignInAfterVerification: true,
    sendOnSignUp: true,
  },
  trustedOrigins: ['http://localhost:3000'],
});
