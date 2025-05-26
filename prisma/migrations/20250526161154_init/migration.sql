/*
  Warnings:

  - You are about to drop the `Role` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserRole` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_UserRoles` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `UserRole` DROP FOREIGN KEY `UserRole_roleId_fkey`;

-- DropForeignKey
ALTER TABLE `UserRole` DROP FOREIGN KEY `UserRole_userId_fkey`;

-- DropForeignKey
ALTER TABLE `_UserRoles` DROP FOREIGN KEY `_UserRoles_A_fkey`;

-- DropForeignKey
ALTER TABLE `_UserRoles` DROP FOREIGN KEY `_UserRoles_B_fkey`;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `role` VARCHAR(191) NOT NULL DEFAULT 'USER';

-- DropTable
DROP TABLE `Role`;

-- DropTable
DROP TABLE `UserRole`;

-- DropTable
DROP TABLE `_UserRoles`;
