import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { PrismaService } from "../prisma/prisma.service";
import 'dotenv/config';
import { sendEmailQueue } from '../utils/rabbitmq';
import { redis } from '../redis';

const Prisma = new PrismaService();
const API_VERSION_FOR_EMAIL_VERIFICATION = process.env.API_VERSION_FOR_EMAIL_VERIFICATION;

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
    async sendVerificationEmail({ user, url }) {
      const fixedUrl = url.replace(
        "/api/auth/verify-email",
        `/api/${API_VERSION_FOR_EMAIL_VERIFICATION}/auth/verify-email`
      );
      await sendEmailQueue({
        email: user.email,
        subject: 'Verify your email address',
        body: `Click the link to verify your email: ${fixedUrl}`,
      });

      await redis.set(
        `sendVerificationEmail:${user.id}`,
        new Date().toISOString().toString(),
        "EX", 300
      );
    },
    autoSignInAfterVerification: true,
    sendOnSignUp: true,
    expiresIn: 300
  },
  trustedOrigins: ['http://localhost:3000'],
});
