import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// Get Detail analysis by id
// URL: /api/analysis/[id]
export async function GET(request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const examResult = await prisma.examAnalysis.findUnique({
    where: {
      id: parseInt(id),
    },
  });

  return NextResponse.json(examResult);
}