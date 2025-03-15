-- CreateTable
CREATE TABLE `exam_analysis` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` VARCHAR(191) NOT NULL,
    `examId` VARCHAR(191) NOT NULL,
    `examName` VARCHAR(191) NOT NULL,
    `subjectId` VARCHAR(191) NOT NULL,
    `subject` VARCHAR(191) NOT NULL,
    `rating` VARCHAR(191) NOT NULL,
    `score` DOUBLE NOT NULL,
    `workingTime` INTEGER NOT NULL DEFAULT 0,
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
    `topicAnalysis` JSON NOT NULL,
    `analysisResult` JSON NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
