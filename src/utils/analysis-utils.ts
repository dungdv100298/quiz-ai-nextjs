import { QuestionLabel, TopicAnalysis } from '@/types/analysis';

export function calculateTopicAnalysis(questionLabels: QuestionLabel[]): TopicAnalysis[] {
  const topicStatsMap = new Map();

  // Process each question
  questionLabels.forEach((question) => {
    const { labels, isCorrect } = question;
    labels.forEach(label => {
      if (!topicStatsMap.has(label)) {
        topicStatsMap.set(label, {
          topic: label,
          questionCount: 0,
          correctCount: 0,
          wrongCount: 0,
          correctPercentage: 0,
          incorrectPercentage: 0,
        });
      }

      const stats = topicStatsMap.get(label);
      stats.questionCount++;

      if (isCorrect) {
        stats.correctCount++;
      } else {
        stats.wrongCount++;
      }
    });
  });

  const result: TopicAnalysis[] = Array.from(topicStatsMap.values()).map(
    (stats) => {
      return {
        ...stats,
        correctPercentage: ((stats.correctCount / stats.questionCount) * 100).toFixed(2),
        incorrectPercentage: ((stats.wrongCount / stats.questionCount) * 100).toFixed(2),
      };
    },
  );

  return result;
}