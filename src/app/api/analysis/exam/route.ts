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

export async function POST(request: NextRequest) {
  try {
    const createAnalysisDto: CreateAnalysisDto = await request.json();
    
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
      createAnalysisDto.language as 'vi' | 'en',
    );

    // Create analysis result
    const analysisResult: AnalysisResultDto = {
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
    };

    // Save analysis to database
    const examAnalysis = await prisma.examAnalysis.create({
      data: {
        examId: createAnalysisDto.examId,
        subject: createAnalysisDto.subject,
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
        analysisResult: analysisResult as any, // JSON type in Prisma
      },
    });

    return NextResponse.json(examAnalysis, { status: 201 });
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