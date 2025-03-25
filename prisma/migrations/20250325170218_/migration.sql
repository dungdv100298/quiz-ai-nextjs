-- AlterTable
ALTER TABLE `exam_analysis` ADD COLUMN `averageSpeed` DOUBLE NULL,
    ADD COLUMN `examLowScoreSameSubject` JSON NULL,
    ADD COLUMN `examUnfinished` JSON NULL,
    ADD COLUMN `strengths` JSON NULL,
    ADD COLUMN `timeSpent` DOUBLE NULL,
    ADD COLUMN `weaknesses` JSON NULL;
