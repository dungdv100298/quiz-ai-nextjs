/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/lib/db";
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

  return NextResponse.json({
    data: examResult,
    pagination: {
      total,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      totalPages: Math.ceil(total / parseInt(pageSize)),
    }
  });
}