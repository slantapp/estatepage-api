/*
  Warnings:

  - Added the required column `transactionReference` to the `PaymentTransaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `PaymentTransaction` ADD COLUMN `transactionReference` VARCHAR(191) NOT NULL;
