-- AlterTable
ALTER TABLE `Estate` ADD COLUMN `currency` VARCHAR(191) NULL,
    ADD COLUMN `emailNotifications` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `paymentReminders` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `reminderDays` INTEGER NOT NULL DEFAULT 7,
    ADD COLUMN `smsNotifications` BOOLEAN NOT NULL DEFAULT false;
