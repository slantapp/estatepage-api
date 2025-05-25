-- AlterTable
ALTER TABLE `User` ADD COLUMN `verificationOTP` VARCHAR(191) NULL,
    MODIFY `firstName` VARCHAR(191) NULL,
    MODIFY `lastName` VARCHAR(191) NULL;
