/*
  Warnings:

  - Added the required column `examResultId` to the `exam_analysis` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `exam_analysis` ADD COLUMN `examResultId` VARCHAR(191) NOT NULL;
