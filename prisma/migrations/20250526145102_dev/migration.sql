/*
  Warnings:

  - You are about to drop the column `userId` on the `Service` table. All the data in the column will be lost.
  - Added the required column `estateId` to the `Service` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Service` DROP FOREIGN KEY `Service_userId_fkey`;

-- DropIndex
DROP INDEX `Service_userId_fkey` ON `Service`;

-- AlterTable
ALTER TABLE `Service` DROP COLUMN `userId`,
    ADD COLUMN `estateId` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `Service` ADD CONSTRAINT `Service_estateId_fkey` FOREIGN KEY (`estateId`) REFERENCES `Estate`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
