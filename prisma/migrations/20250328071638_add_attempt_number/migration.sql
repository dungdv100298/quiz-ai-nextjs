/*
  Warnings:

  - Added the required column `attemptNumber` to the `exam_analysis` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `exam_analysis` ADD COLUMN `attemptNumber` INTEGER NOT NULL;
