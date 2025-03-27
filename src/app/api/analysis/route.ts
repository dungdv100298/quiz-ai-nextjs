/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/lib/db";
import { AnalysisResultDto, ExamResult, TopicAnalysis } from "@/types/analysis";
import { NextRequest, NextResponse } from "next/server";

// get exam result by page, pageSize, sortBy, sortOrder, filter by userId and examId
// URL: /api/analysis?page=1&pageSize=10&sortBy=createdAt&sortOrder=desc&userId=1&examId=1&examName=1&subjectId=1&subjectName=1
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get("page") || "1";
  const pageSize = searchParams.get("pageSize") || "10";
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const sortOrder = searchParams.get("sortOrder") || "desc";
  const userId = searchParams.get("userId") || "";  
  const examId = searchParams.get("examId") || "";
  const examName = searchParams.get("examName") || "";
  const subjectId = searchParams.get("subjectId") || "";
  const subjectName = searchParams.get("subjectName") || "";

  const whereCondition: any = {};
  
  if (userId) {
    whereCondition.userId = userId;
  }
  
  if (examId) {
    whereCondition.examId = examId;
  }

  if (subjectId) {
    whereCondition.subjectId = subjectId;
  }
  
  if (examName) {
    whereCondition.examName = {
      contains: examName
    };
  }

  if (subjectName) {
    whereCondition.subject = {
      contains: subjectName
    };
  }

  const examResult = await prisma.examAnalysis.findMany({
    where: whereCondition,
    orderBy: {
      [sortBy]: sortOrder,
    },
    skip: (parseInt(page) - 1) * parseInt(pageSize),
    take: parseInt(pageSize),
  });

  // Đếm tổng số bản ghi để phân trang
  const total = await prisma.examAnalysis.count({
    where: whereCondition,
  });

  const examAnalysis: AnalysisResultDto[] = examResult.map((result) => {
    const analysisResult = JSON.parse(JSON.stringify(result));
    return {
      id: analysisResult.id || 0,
      examResultId: analysisResult.examResultId,
      userId: analysisResult.userId,
      summary: {
        examName: analysisResult.examName,
        subject: analysisResult.subject,
        score: analysisResult.score,
        time: analysisResult.workingTime,
      },
      detailExamResult: {
        totalQuestions: analysisResult.totalQuestions,
        emptyAnswers: analysisResult.emptyAnswers,
        correctAnswers: analysisResult.correctAnswers,
        wrongAnswers: analysisResult.wrongAnswers,
        rating: analysisResult.rating,
      },
      topicAnalysis: analysisResult.topicAnalysis 
        ? (JSON.parse(JSON.stringify(analysisResult.topicAnalysis)) as TopicAnalysis[]) 
        : [],
      workingTimeAnalysis: {
        workingTime: analysisResult.workingTime,
        averageSpeed: analysisResult.averageSpeed,
        timeSpent: analysisResult.timeSpent,
      },
      inputTokens: analysisResult.inputTokens,
      outputTokens: analysisResult.outputTokens,
      totalTokens: analysisResult.totalTokens,
      inputCost: analysisResult.inputCost,
      outputCost: analysisResult.outputCost,
      totalCost: analysisResult.totalCost,
      strengths: analysisResult.strengths as string[] || [],
      weaknesses: analysisResult.weaknesses as string[] || [],
      strengthsAnalysis: analysisResult.strengthsAnalysis || "",
      weaknessesAnalysis: analysisResult.weaknessesAnalysis || "",
      improvementSuggestions: analysisResult.improvementSuggestions || "",
      timeAnalysisSuggestions: analysisResult.timeAnalysisSuggestions || "",
      examUnfinished: analysisResult.examUnfinished as ExamResult[] || [],
      examLowScoreSameSubject: analysisResult.examLowScoreSameSubject as ExamResult[] || [],
      createdAt: analysisResult.createdAt,
    }
  });

  return NextResponse.json({
    data: examAnalysis,
    pagination: {
      total,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      totalPages: Math.ceil(total / parseInt(pageSize)),
    }
  });
}