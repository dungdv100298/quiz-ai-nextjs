export interface QuestionLabel {
  id: number;
  label: string;
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
  subject: string;
  examContent: string;
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
  improvementSuggestions: string;
  timeAnalysisSuggestions: string;
  studyMethodSuggestions: string;
  nextExamSuggestions: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  inputCost: number;
  outputCost: number;
  totalCost: number;
}