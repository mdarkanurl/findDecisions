-- CreateEnum
CREATE TYPE "Role" AS ENUM ('user', 'admin', 'system');

-- CreateTable
CREATE TABLE "decisions" (
    "id" TEXT NOT NULL,
    "actorType" "Role" NOT NULL,
    "actorId" TEXT,
    "action" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "context" JSONB,
    "outcome" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "decisions_pkey" PRIMARY KEY ("id")
);
