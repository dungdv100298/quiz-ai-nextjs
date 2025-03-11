/*
  Warnings:

  - You are about to drop the `ExamAnalysis` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `ExamAnalysis`;

-- DropTable
DROP TABLE `User`;

-- CreateTable
CREATE TABLE `exam_analysis` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `examId` VARCHAR(191) NOT NULL,
    `subject` VARCHAR(191) NOT NULL,
    `rating` VARCHAR(191) NOT NULL,
    `inputTokens` DOUBLE NOT NULL,
    `outputTokens` DOUBLE NOT NULL,
    `totalTokens` DOUBLE NOT NULL,
    `inputCost` DOUBLE NOT NULL,
    `outputCost` DOUBLE NOT NULL,
    `totalCost` DOUBLE NOT NULL,
    `totalQuestions` DOUBLE NOT NULL,
    `emptyAnswers` DOUBLE NOT NULL,
    `correctAnswers` DOUBLE NOT NULL,
    `wrongAnswers` DOUBLE NOT NULL,
    `questionLabels` JSON NOT NULL,
    `analysisResult` JSON NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
