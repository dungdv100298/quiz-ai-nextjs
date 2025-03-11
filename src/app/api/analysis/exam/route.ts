/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { 
  CreateAnalysisDto, 
  AnalysisResultDto,
} from '@/types/analysis';
import { calculateTopicAnalysis } from '@/utils/analysis-utils';

// Khởi tạo Prisma singleton
const globalForPrisma = global as unknown as { prisma: PrismaClient };
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query'],
  });
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export const config = {
  runtime: 'edge',
};

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

    // Tạo phân tích ban đầu và lưu vào DB không chờ AI
    const initialAnalysis = await prisma.examAnalysis.create({
      data: {
        examId: createAnalysisDto.examId,
        subject: createAnalysisDto.subject,
        rating: createAnalysisDto.rating,
        inputTokens: 0,
        outputTokens: 0,
        totalTokens: 0,
        inputCost: 0,
        outputCost: 0,
        totalCost: 0,
        totalQuestions: createAnalysisDto.totalQuestions,
        emptyAnswers: createAnalysisDto.emptyAnswers,
        correctAnswers: createAnalysisDto.correctAnswers,
        wrongAnswers: createAnalysisDto.wrongAnswers,
        questionLabels: createAnalysisDto.questionLabels as any,
        analysisResult: null,
        status: 'PROCESSING',
      },
    });

    // Trigger AI analysis asynchronously
    // Gọi một API khác để xử lý phân tích AI (thêm endpoint mới)
    fetch(`${request.nextUrl.origin}/api/analysis/process-ai`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        analysisId: initialAnalysis.id,
        subject: createAnalysisDto.subject,
        score: createAnalysisDto.score,
        averageSpeed,
        timeSpent,
        strengths,
        weaknesses,
        topicAnalysis,
        language: createAnalysisDto.language,
        // Các thông tin khác cần thiết
      }),
    }).catch(err => console.error('Failed to trigger AI analysis:', err));

    return NextResponse.json(
      { 
        ...initialAnalysis, 
        message: 'Analysis started. Results will be available soon.' 
      }, 
      { status: 202 }
    );
  } catch (error) {
    console.error('Error analyzing exam:', error);
    return NextResponse.json(
      { error: 'Failed to analyze exam', details: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}