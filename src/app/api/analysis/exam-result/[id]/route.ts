/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import {
  CreateAnalysisDto,
  AnalysisResultDto,
  QuestionLabel,
  ExamResult,
} from "@/types/analysis";
import { calculateTopicAnalysis } from "@/utils/analysis-utils";
import { generateAISuggestions } from "@/utils/ai-suggestions";
import mysql from "mysql2/promise";

const prisma = new PrismaClient();

export const maxDuration = 60;

// URL: /api/analysis/exam-result/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Call API https://studio-dev.eduquiz.io.vn/quizexam/api/v1/exam-results/{id}
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_EDUQUIZ_API_URL}/quizexam/api/v1/exam-results/${id}`
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
        createdAt: "desc",
      },
      take: 5,
    });
    const examUnfinished = await getUnfinishedExams(
      createAnalysisDto.userId,
      createAnalysisDto.subjectId
    );
    const examLowScoreSameSubject = await getExamLowScoreSameSubject(
      createAnalysisDto.userId,
      createAnalysisDto.subjectId
    );
    const historyScore =
      examAnalysis?.map((item: any) => item.score as number) || [];
    const historyWorkingTime =
      examAnalysis?.map((item: any) => item.workingTime as number) || [];
    const historyQuestionLabels = getHistoryQuestionLabels(examAnalysis);
    // Calculate topic analysis
    const topicAnalysis = calculateTopicAnalysis(
      createAnalysisDto.questionLabels
    );
    const averageSpeed =
      createAnalysisDto.time / createAnalysisDto.totalQuestions;
    const timeSpent =
      createAnalysisDto.workingTime / createAnalysisDto.totalQuestions;

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
      historyQuestionLabels
    );

    // Create analysis result
    const analysisResult: AnalysisResultDto = {
      userId: createAnalysisDto.userId,
      summary: {
        examName: createAnalysisDto.examName,
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
      strengthsAnalysis: aiSuggestions.strengthsAnalysis,
      weaknessesAnalysis: aiSuggestions.weaknessesAnalysis,
      improvementSuggestions: aiSuggestions.improvementSuggestions,
      timeAnalysisSuggestions: aiSuggestions.timeAnalysisSuggestions,
      examUnfinished: examUnfinished as ExamResult[],
      examLowScoreSameSubject: examLowScoreSameSubject as ExamResult[],
    };

    // Save analysis to database
    await prisma.examAnalysis.create({
      data: {
        examId: createAnalysisDto.examId,
        userId: createAnalysisDto.userId,
        subjectId: createAnalysisDto.subjectId,
        subject: createAnalysisDto.subject,
        examName: createAnalysisDto.examName,
        score: createAnalysisDto.score,
        workingTime: createAnalysisDto.workingTime,
        averageSpeed: averageSpeed,
        timeSpent: timeSpent,
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
        strengths: strengths as any, // JSON type in Prisma
        weaknesses: weaknesses as any, // JSON type in Prisma
        examUnfinished: examUnfinished as any, // JSON type in Prisma
        examLowScoreSameSubject: examLowScoreSameSubject as any, // JSON type in Prisma
        analysisResult: {
          strengthsAnalysis: aiSuggestions.strengthsAnalysis,
          weaknessesAnalysis: aiSuggestions.weaknessesAnalysis,
          improvementSuggestions: aiSuggestions.improvementSuggestions,
          timeAnalysisSuggestions: aiSuggestions.timeAnalysisSuggestions,
        }, // JSON type in Prisma
      },
    });

    return NextResponse.json(analysisResult, { status: 201 });
  } catch (error) {
    console.error("Error analyzing exam:", error);
    return NextResponse.json(
      { error: "Failed to analyze exam" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

function getHistoryQuestionLabels(examAnalysis: any) {
  try {
    return (
      examAnalysis?.map((item: any) => {
        const text = item.topicAnalysis.map((topic: any) => {
          return {
            topic: topic.topic,
            correctPercentage: topic.correctPercentage,
          };
        }) as any;
        return text;
      }) || []
    );
  } catch {
    return [];
  }
}

function formatExamResult(inputData: any): CreateAnalysisDto {
  const data = inputData.data;

  const questionLabels: QuestionLabel[] = processQuestions(data.sections);

  const result: CreateAnalysisDto = {
    examId: data.exam_id.toString(),
    userId: data.user_id.toString(),
    examName: data.exam.name,
    subject: data?.subject_data?.name || "Chưa xác định",
    subjectId: data?.subject_data?.id ? String(data?.subject_data?.id) : "",
    time: data.total_time,
    workingTime: data.total_time_used,
    score: data.total_score,
    rating: data.rank_data ? data.rank_data.name : "Không xếp hạng",
    totalQuestions: data.total_question,
    emptyAnswers: data.total_question_blank,
    correctAnswers: data.total_question_true,
    wrongAnswers: data.total_question_false,
    questionLabels: questionLabels,
  };
  return result;
}

function processQuestions(sections: any): QuestionLabel[] {
  const labelsMap = new Map<number, string[]>();

  sections.forEach((section: any) => {
    if (
      section.question_data.labels &&
      section.question_data.labels.length > 0
    ) {
      const labels = section.question_data.labels.map(
        (label: any) => label.name
      );
      labelsMap.set(section.question_id, labels);
    }
  });

  return sections
    .filter((section: any) => {
      const hasChildren =
        section.question_data.children_questions !== undefined &&
        section.question_data.children_questions !== null;

      const childrenCount = hasChildren
        ? section.question_data.children_questions!.length
        : 0;

      return !hasChildren || childrenCount <= 1;
    })
    .map((section: any) => {
      const id = section.question_data.id;

      let labels: string[] = [];

      if (
        section.question_data.labels &&
        section.question_data.labels.length > 0
      ) {
        labels = section.question_data.labels.map((label: any) => label.name);
      } else if (section.parent_id !== 0 && labelsMap.has(section.parent_id)) {
        labels = labelsMap.get(section.parent_id) || [];
      }

      const isCorrect = section.is_correct;

      return {
        id,
        labels,
        isCorrect,
        isBlank: !section.answer_choosed_data,
      };
    });
}

async function getUnfinishedExams(userId: string, subjectId: string): Promise<ExamResult[]> {
  try {
    const connection = await mysql.createConnection(
      process.env.DATABASE_EDUQUIZ_DEV_URL || ""
    );

    const [rows] = await connection.execute(`
      SELECT qe.*
      FROM quiz_exams qe
      JOIN eduprep_dev.exam_subject_map esm ON qe.id = esm.exam_id
      WHERE esm.subject_id = ${subjectId}
      AND NOT EXISTS (
          SELECT 1
          FROM quiz_exam_results_v2 qer
          WHERE qer.exam_id = qe.id
          AND qer.user_id = ${userId}
      )
      LIMIT 5;
    `);

    const examUnfinished: ExamResult[] = Array.isArray(rows)
      ? rows.map((exam: any) => ({
          examId: String(exam.id),
          examName: exam.name || "Bài thi không xác định",
          alias: exam.alias || "",
        }))
      : [];

    await connection.end();
    return examUnfinished;
  } catch (error) {
    console.error("Error querying eduquiz database:", error);
    return [];
  }
}

async function getExamLowScoreSameSubject(userId: string, subjectId: string): Promise<ExamResult[]> {
  try {
    const connection = await mysql.createConnection(
      process.env.DATABASE_EDUQUIZ_DEV_URL || ""
    );

    const [rows] = await connection.execute(`
      SELECT DISTINCT 
          bt.*,
          MAX(kqt.total_score) as total_score
      FROM 
          quiz_exams bt
      JOIN 
          eduprep_dev.exam_subject_map bsm ON bt.id = bsm.exam_id
      JOIN 
          quiz_exam_results_v2 kqt ON bt.id = kqt.exam_id
      WHERE 
          kqt.user_id = ${userId}
          AND bsm.subject_id = ${subjectId}
          AND kqt.total_score < 5
      GROUP BY 
          bt.id 
    `);

    const examUnfinished = Array.isArray(rows)
      ? rows.map((exam: any) => ({
          examId: String(exam.id),
          examName: exam.name || "Bài thi không xác định",
          alias: exam.alias || "",
        }))
      : [];

    await connection.end();

    return examUnfinished;
  } catch (error) {
    console.error("Error querying eduquiz database:", error);
    return [];
  }
}
