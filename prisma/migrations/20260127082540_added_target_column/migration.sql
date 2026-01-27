/*
  Warnings:

  - Added the required column `target` to the `ProjectInvite` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ProjectInvite" ADD COLUMN     "target" TEXT NOT NULL;
