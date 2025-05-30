/*
  Warnings:

  - You are about to alter the column `transactionId` on the `PaymentTransaction` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.

*/
-- AlterTable
ALTER TABLE `PaymentTransaction` MODIFY `transactionId` INTEGER NOT NULL;
