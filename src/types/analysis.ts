export interface QuestionLabel {
  id: number;
  labels: string[];
  isCorrect: boolean;
  isBlank: boolean;
}
export interface ExamResult {
  examId: string;
  examName: string;
  alias: string;
}
export interface TopicAnalysis {
  topic: string;
  questionCount: number;
  correctCount: number;
  wrongCount: number;
  blankCount: number;
  correctPercentage: number;
  incorrectPercentage: number;
}

export interface CreateAnalysisDto {
  examId: string;
  userId: string;
  subject: string;
  subjectId: string;
  examName: string;
  score: number;
  time: number;
  totalQuestions: number;
  emptyAnswers: number;
  correctAnswers: number;
  wrongAnswers: number;
  rating: string;
  questionLabels: QuestionLabel[];
  workingTime: number;
  language?: string;
}

export interface AnalysisResultDto {
  userId: string;
  summary: {
    examName: string;
    subject: string;
    score: number;
    time: number;
  };
  detailExamResult: {
    totalQuestions: number;
    emptyAnswers: number;
    correctAnswers: number;
    wrongAnswers: number;
    rating: string;
  };
  topicAnalysis: TopicAnalysis[];
  workingTimeAnalysis: {
    workingTime: number | null;
    averageSpeed: number | null;
    timeSpent: number | null;
  };
  strengths: string[];
  weaknesses: string[];
  strengthsAnalysis: string;
  weaknessesAnalysis: string;
  improvementSuggestions: string;
  timeAnalysisSuggestions: string;
  studyMethodSuggestions?: string;
  historyScoreSuggestions?: string;
  historyWorkingTimeSuggestions?: string;
  historyQuestionLabels?: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  inputCost: number;
  outputCost: number;
  totalCost: number;
  examUnfinished: ExamResult[];
  examLowScoreSameSubject: ExamResult[];
}