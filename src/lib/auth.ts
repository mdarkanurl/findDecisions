import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { PrismaService } from "../prisma/prisma.service";
import 'dotenv/config';
import { sendEmailQueue } from '../utils/rabbitmq';
import { redis } from '../redis';

const Prisma = new PrismaService();
const API_VERSION = process.env.API_VERSION || "v1";

export const auth = betterAuth({
  url: process.env.BETTER_AUTH_URL!,
  secret: process.env.BETTER_AUTH_SECRET!,
  database: prismaAdapter(Prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({user, url, token}, request) => {
      const fixedUrl = url.replace(
        "/api/auth/reset-password",
        `/api/${API_VERSION}/auth/reset-password`
      );
      await sendEmailQueue({
        email: user.email,
        subject: "Reset your password",
        body: `Click the link to reset your password: ${fixedUrl}`,
      });

      await redis.set(
        `sendResetPasswordEmail:${user.email}`,
        new Date().toISOString().toString(),
        "EX", 300
      );
    },
    resetPasswordTokenExpiresIn: 300,
    revokeSessionsOnPasswordReset: true,
    onPasswordReset: async ({ user }, request) => {
      console.log(`Password for user ${user.email} has been reset.`);
    },
  },
  emailVerification: {
    async sendVerificationEmail({ user, url }) {
      const fixedUrl = url.replace(
        "/api/auth/verify-email",
        `/api/${API_VERSION}/auth/verify-email`
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
  rateLimit: {
    enabled: true,
    window: 60,
    max: 100,
    customRules: {
      "/sign-in/email": {
        window: 10,
        max: 3
      },
      "/sign-up/email": {
        window: 10,
        max: 3
      }
    }
  },
  advanced: {
    ipAddress: {
      ipAddressHeaders: ["x-forwarded-for", "cf-connecting-ip"]
    }
  },
  trustedOrigins: ['http://localhost:3000'],
});
