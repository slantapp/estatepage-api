/*
  Warnings:

  - A unique constraint covering the columns `[paymentReference]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.
  - Made the column `paymentReference` on table `Payment` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `Payment` MODIFY `paymentReference` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Payment_paymentReference_key` ON `Payment`(`paymentReference`);
