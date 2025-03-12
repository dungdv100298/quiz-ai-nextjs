import React from 'react';

export const metadata = {
  title: 'Phân tích kết quả bài thi - EduQuiz AI',
  description: 'Công cụ phân tích kết quả bài thi, đánh giá điểm mạnh, điểm yếu và đưa ra gợi ý cải thiện',
};

export default function ExamAnalysisLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <section className="min-h-screen bg-gray-50">
      {children}
    </section>
  );
} 