/*
  Warnings:

  - You are about to drop the column `verifiedUser` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `User` DROP COLUMN `verifiedUser`,
    ADD COLUMN `verificationStatus` VARCHAR(191) NOT NULL DEFAULT 'UNVERIFIED';
