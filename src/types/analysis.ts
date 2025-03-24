export interface QuestionLabel {
  id: number;
  labels: string[];
  isCorrect: boolean;
}

export interface TopicAnalysis {
  topic: string;
  questionCount: number;
  correctCount: number;
  wrongCount: number;
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
    workingTime: number;
    averageSpeed: number;
    timeSpent: number;
  };
  strengths: string[];
  weaknesses: string[];
  strengthsAnalysis: string;
  weaknessesAnalysis: string;
  improvementSuggestions: string;
  timeAnalysisSuggestions: string;
  studyMethodSuggestions?: string;
  nextExamSuggestions: string;
  historyScoreSuggestions?: string;
  historyWorkingTimeSuggestions?: string;
  historyQuestionLabels?: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  inputCost: number;
  outputCost: number;
  totalCost: number;
}