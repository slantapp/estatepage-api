-- CreateTable
CREATE TABLE `EstateFeature` (
    `id` VARCHAR(191) NOT NULL,
    `estateId` VARCHAR(191) NOT NULL,
    `featureName` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `iconUrl` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EstateGallery` (
    `id` VARCHAR(191) NOT NULL,
    `estateId` VARCHAR(191) NOT NULL,
    `imageUrl` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EstateStreet` (
    `id` VARCHAR(191) NOT NULL,
    `estateId` VARCHAR(191) NOT NULL,
    `imageUrl` VARCHAR(191) NOT NULL,
    `streetName` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `EstateFeature` ADD CONSTRAINT `EstateFeature_estateId_fkey` FOREIGN KEY (`estateId`) REFERENCES `Estate`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EstateGallery` ADD CONSTRAINT `EstateGallery_estateId_fkey` FOREIGN KEY (`estateId`) REFERENCES `Estate`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EstateStreet` ADD CONSTRAINT `EstateStreet_estateId_fkey` FOREIGN KEY (`estateId`) REFERENCES `Estate`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
