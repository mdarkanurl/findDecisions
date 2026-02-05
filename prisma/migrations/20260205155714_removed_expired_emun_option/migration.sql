/*
  Warnings:

  - The values [EXPIRED] on the enum `inviteStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "inviteStatus_new" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'REVOKED');
ALTER TABLE "public"."ProjectInvite" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "ProjectInvite" ALTER COLUMN "status" TYPE "inviteStatus_new" USING ("status"::text::"inviteStatus_new");
ALTER TYPE "inviteStatus" RENAME TO "inviteStatus_old";
ALTER TYPE "inviteStatus_new" RENAME TO "inviteStatus";
DROP TYPE "public"."inviteStatus_old";
ALTER TABLE "ProjectInvite" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;
