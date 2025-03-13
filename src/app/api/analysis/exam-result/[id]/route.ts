/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { 
  CreateAnalysisDto, 
  AnalysisResultDto,
} from '@/types/analysis';
import { calculateTopicAnalysis } from '@/utils/analysis-utils';
import { generateAISuggestions } from '@/utils/ai-suggestions';

const prisma = new PrismaClient();

export const maxDuration = 60;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Call API https://studio-dev.eduquiz.io.vn/quizexam/api/v1/exam-results/{id}
    const response = await fetch(
      `https://studio-dev.eduquiz.io.vn/quizexam/api/v1/exam-results/${id}`
    );
    const data = await response.json();
  
    const formattedData = formatExamResult(data);

    const createAnalysisDto: CreateAnalysisDto = formattedData;

    // query list history score by userId and examId in  exam_analysis table
    const examAnalysis = await prisma.examAnalysis.findMany({
      where: {
        userId: createAnalysisDto.userId,
        examId: createAnalysisDto.examId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 5,
    });
    const historyScore = examAnalysis?.map((item: any) => item.score as number) || [];
    const historyWorkingTime = examAnalysis?.map((item: any) => item.workingTime as number) || [];
    const historyQuestionLabels = getHistoryQuestionLabels(examAnalysis);
    // Calculate topic analysis
    const topicAnalysis = calculateTopicAnalysis(createAnalysisDto.questionLabels);
    const averageSpeed = createAnalysisDto.time / createAnalysisDto.totalQuestions;
    const timeSpent = createAnalysisDto.workingTime / createAnalysisDto.totalQuestions;

    // Identify strengths and weaknesses
    const strengths = topicAnalysis
      .filter((topic) => topic.correctPercentage >= 80)
      .map((topic) => topic.topic);

    const weaknesses = topicAnalysis
      .filter((topic) => topic.correctPercentage < 50)
      .map((topic) => topic.topic);

    // Generate AI suggestions
    const aiSuggestions = await generateAISuggestions(
      createAnalysisDto.subject,
      createAnalysisDto.score,
      averageSpeed,
      timeSpent,
      strengths,
      weaknesses,
      topicAnalysis,
      historyScore,
      historyWorkingTime,
      historyQuestionLabels,
    );

    // Create analysis result
    const analysisResult: AnalysisResultDto = {
      userId: createAnalysisDto.userId,
      summary: {
        examName: createAnalysisDto.examContent,
        subject: createAnalysisDto.subject,
        score: createAnalysisDto.score,
        time: createAnalysisDto.time,
      },
      detailExamResult: {
        totalQuestions: createAnalysisDto.totalQuestions,
        emptyAnswers: createAnalysisDto.emptyAnswers,
        correctAnswers: createAnalysisDto.correctAnswers,
        wrongAnswers: createAnalysisDto.wrongAnswers,
        rating: createAnalysisDto.rating,
      },
      topicAnalysis,
      workingTimeAnalysis: {
        workingTime: createAnalysisDto.workingTime,
        averageSpeed,
        timeSpent,
      },
      inputTokens: aiSuggestions.inputTokens,
      outputTokens: aiSuggestions.outputTokens,
      totalTokens: aiSuggestions.totalTokens,
      inputCost: aiSuggestions.inputCost,
      outputCost: aiSuggestions.outputCost,
      totalCost: aiSuggestions.totalCost,
      strengths,
      weaknesses,
      improvementSuggestions: aiSuggestions.improvementSuggestions,
      timeAnalysisSuggestions: aiSuggestions.timeAnalysisSuggestions,
      studyMethodSuggestions: aiSuggestions.studyMethodSuggestions,
      nextExamSuggestions: aiSuggestions.nextExamSuggestions,
      historyScoreSuggestions: historyScore.length > 0 ? aiSuggestions.historyScoreSuggestions : '',
      historyWorkingTimeSuggestions: historyWorkingTime.length > 0 ? aiSuggestions.historyWorkingTimeSuggestions : '',
      historyQuestionLabels: historyQuestionLabels.length > 0 ? aiSuggestions.historyQuestionLabels : '',
    };

    // Save analysis to database
    await prisma.examAnalysis.create({
      data: {
        examId: createAnalysisDto.examId,
        userId: createAnalysisDto.userId,
        subject: createAnalysisDto.subject,
        score: createAnalysisDto.score,
        workingTime: createAnalysisDto.workingTime,
        rating: createAnalysisDto.rating,
        inputTokens: aiSuggestions.inputTokens,
        outputTokens: aiSuggestions.outputTokens,
        totalTokens: aiSuggestions.totalTokens,
        inputCost: aiSuggestions.inputCost,
        outputCost: aiSuggestions.outputCost,
        totalCost: aiSuggestions.totalCost,
        totalQuestions: createAnalysisDto.totalQuestions,
        emptyAnswers: createAnalysisDto.emptyAnswers,
        correctAnswers: createAnalysisDto.correctAnswers,
        wrongAnswers: createAnalysisDto.wrongAnswers,
        questionLabels: createAnalysisDto.questionLabels as any, // JSON type in Prisma
        topicAnalysis: topicAnalysis as any, // JSON type in Prisma
        analysisResult: {
          improvementSuggestions: aiSuggestions.improvementSuggestions,
          timeAnalysisSuggestions: aiSuggestions.timeAnalysisSuggestions,
          studyMethodSuggestions: aiSuggestions.studyMethodSuggestions,
          nextExamSuggestions: aiSuggestions.nextExamSuggestions,
          historyScoreSuggestions: historyScore.length > 0 ? aiSuggestions.historyScoreSuggestions : '',
          historyWorkingTimeSuggestions: historyWorkingTime.length > 0 ? aiSuggestions.historyWorkingTimeSuggestions : '',
          historyQuestionLabels: historyQuestionLabels.length > 0 ? aiSuggestions.historyQuestionLabels : '',
        }, // JSON type in Prisma
      },
    });

    return NextResponse.json(analysisResult, { status: 201 });
  } catch (error) {
    console.error('Error analyzing exam:', error);
    return NextResponse.json(
      { error: 'Failed to analyze exam' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

function getHistoryQuestionLabels(examAnalysis: any) {
  try {
    return examAnalysis?.map((item: any) => {
      const text = item.topicAnalysis.map((topic: any) =>  {
        return {
          topic: topic.topic,
          correctPercentage: topic.correctPercentage,
        }
      }) as any
      return text;
    }) || [];
  } catch {
    return [];
  }
}

function formatExamResult(inputData: any): CreateAnalysisDto {
  const data = inputData.data;
  
  const subject = data?.subject_data?.name || "Chưa xác định";
  
  const questionLabels = data.sections.map((section: any) => {
    const questionNumberMatch = section.question_data.name.match(/Câu\s+(\d+)/i);
    const questionNumber = questionNumberMatch ? parseInt(questionNumberMatch[1]) : 0;
    
    const label = section.question_data.labels && section.question_data.labels.length > 0 
      ? section.question_data.labels[0].name 
      : "Không có nhãn";
    
    return {
      questionNumber,
      label,
      isCorrect: section.is_correct
    };
  });
  
  const result: CreateAnalysisDto = {
    examId: data.exam_id.toString(),
    userId: data.user_id.toString(),
    examContent: "Bài kiểm tra",
    subject: subject,
    time: data.total_time,
    workingTime: data.total_time_used,
    score: data.total_score,
    rating: data.rank_data ? data.rank_data.name : "Không xếp hạng",
    totalQuestions: data.total_question,
    emptyAnswers: data.total_question_blank,
    correctAnswers: data.total_question_true,
    wrongAnswers: data.total_question_false,
    questionLabels: questionLabels
  };
  
  return result;
}