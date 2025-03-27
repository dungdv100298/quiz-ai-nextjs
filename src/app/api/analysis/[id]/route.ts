import { prisma } from "@/lib/db";
import { AnalysisResultDto, TopicAnalysis } from "@/types/analysis";
import { NextRequest, NextResponse } from "next/server";

// Get Detail analysis by id
// URL: /api/analysis/[id]
export async function GET(request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const examResult = await prisma.examAnalysis.findFirst({
    where: {
      OR: [
        { id: parseInt(id) },
        { examResultId: id }
      ]
    },
  });

  const examResultJson = JSON.parse(JSON.stringify(examResult));


  const analysisResult: AnalysisResultDto = {
    id: examResult?.id || 0,
    examResultId: examResultJson?.id || "",
    userId: examResult?.userId || "",
    summary: {
      examName: examResult?.examName || "",
      subject: examResult?.subject || "",
      score: examResult?.score || 0,
      time: examResult?.workingTime || 0,
    },
    detailExamResult: {
      totalQuestions: examResult?.totalQuestions || 0,
      emptyAnswers: examResult?.emptyAnswers || 0,
      correctAnswers: examResult?.correctAnswers || 0,
      wrongAnswers: examResult?.wrongAnswers || 0,
      rating: examResult?.rating || "",
    },
    topicAnalysis: examResult?.topicAnalysis 
      ? (JSON.parse(JSON.stringify(examResult.topicAnalysis)) as TopicAnalysis[]) 
      : [],
    workingTimeAnalysis: {
      workingTime: examResult?.workingTime || 0,
      averageSpeed: examResultJson?.averageSpeed || 0,
      timeSpent: examResultJson?.timeSpent || 0,
    },
    inputTokens: examResult?.inputTokens || 0,
    outputTokens: examResult?.outputTokens || 0,
    totalTokens: examResult?.totalTokens || 0,
    inputCost: examResult?.inputCost || 0,
    outputCost: examResult?.outputCost || 0,
    totalCost: examResult?.totalCost || 0,
    strengths: examResultJson?.strengths as string[] || [],
    weaknesses: examResultJson?.weaknesses as string[] || [],
    strengthsAnalysis: examResultJson?.analysisResult?.strengthsAnalysis || "",
    weaknessesAnalysis: examResultJson?.analysisResult?.weaknessesAnalysis || "",
    improvementSuggestions: examResultJson?.analysisResult?.improvementSuggestions || "",
    timeAnalysisSuggestions: examResultJson?.analysisResult?.timeAnalysisSuggestions || "",
    examUnfinished: examResultJson?.examUnfinished || [],
    examLowScoreSameSubject: examResultJson?.examLowScoreSameSubject || [],
    createdAt: examResult?.createdAt,
  };

  return NextResponse.json(analysisResult);
}