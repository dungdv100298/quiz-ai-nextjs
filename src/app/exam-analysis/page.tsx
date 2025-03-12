'use client';

import React, { useState } from 'react';
import { AnalysisResultDto } from '@/types/analysis';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';

export default function ExamAnalysisPage() {
  const [examId, setExamId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResultDto | null>(null);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!examId.trim()) {
      setError('Vui lòng nhập ID bài thi');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/analysis/exam-result/${examId}`);
      
      if (!response.ok) {
        throw new Error('Không thể phân tích bài thi này');
      }

      const data = await response.json();
      setAnalysisResult(data);
    } catch (err) {
      setError('Đã xảy ra lỗi khi phân tích bài thi');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const AnalysisSection = ({ title, content, bgColorClass, textColorClass='' }: { title: string, content: string, bgColorClass: string, textColorClass: string }) => {
    return (
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">{title}</h3>
        <div className={`${bgColorClass} p-4 rounded-lg`}>
          <div className={`${textColorClass} prose max-w-none`}>
            <ReactMarkdown rehypePlugins={[rehypeRaw]}>
              {content}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Phân tích bài thi</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <form onSubmit={handleAnalyze} className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={examId}
              onChange={(e) => setExamId(e.target.value)}
              placeholder="Nhập ID bài thi"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? 'Đang phân tích...' : 'Phân tích'}
          </button>
        </form>
        
        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        <div className="mt-6 text-sm text-gray-600">
          <p>Nhập ID bài thi để phân tích kết quả, đánh giá điểm mạnh, điểm yếu và nhận gợi ý cải thiện.</p>
          <p className="mt-2">Ví dụ ID bài thi: 123456</p>
        </div>
      </div>

      {!analysisResult && !loading && (
        <div className="bg-white rounded-lg shadow-md p-6 opacity-60">
          <h2 className="text-xl font-semibold mb-4">Preview kết quả phân tích</h2>
          
          {/* Preview Tổng quan */}
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-3">Tổng quan</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">Môn học</p>
                <p className="text-xl font-bold">Toán học</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-800">Điểm số</p>
                <p className="text-xl font-bold">8.5</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-sm text-yellow-800">Tổng thời gian</p>
                <p className="text-xl font-bold">90 phút</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-purple-800">Xếp hạng</p>
                <p className="text-xl font-bold">Giỏi</p>
              </div>
            </div>
          </div>
          
          {/* Preview Chi tiết kết quả */}
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-3">Chi tiết kết quả</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700">Tổng số câu hỏi</p>
                <p className="text-xl font-bold">50</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-700">Số câu đúng</p>
                <p className="text-xl font-bold">42</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-sm text-red-700">Số câu sai</p>
                <p className="text-xl font-bold">5</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Số câu bỏ trống</p>
                <p className="text-xl font-bold">3</p>
              </div>
            </div>
          </div>
          
          <div className="text-center py-4">
            <p className="text-gray-500 italic">Nhập ID bài thi của bạn để xem phân tích chi tiết</p>
            <div className="mt-4 animate-pulse">
              <div className="h-2.5 bg-gray-200 rounded-full w-32 mb-2.5 mx-auto"></div>
              <div className="h-2.5 bg-gray-200 rounded-full w-48 mb-2.5 mx-auto"></div>
              <div className="h-2.5 bg-gray-200 rounded-full w-40 mb-2.5 mx-auto"></div>
            </div>
          </div>
        </div>
      )}

      {analysisResult && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Kết quả phân tích</h2>
          
          {/* Phần tổng quan */}
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-3">Tổng quan</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">Môn học</p>
                <p className="text-xl font-bold">{analysisResult.summary.subject}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-800">Điểm số</p>
                <p className="text-xl font-bold">{analysisResult.summary.score}</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-sm text-yellow-800">Tổng thời gian</p>
                <p className="text-xl font-bold">{analysisResult.summary.time} phút</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-purple-800">Xếp hạng</p>
                <p className="text-xl font-bold">{analysisResult.detailExamResult.rating}</p>
              </div>
            </div>
          </div>
          
          {/* Chi tiết kết quả */}
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-3">Chi tiết kết quả</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700">Tổng số câu hỏi</p>
                <p className="text-xl font-bold">{analysisResult.detailExamResult.totalQuestions}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-700">Số câu đúng</p>
                <p className="text-xl font-bold">{analysisResult.detailExamResult.correctAnswers}</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-sm text-red-700">Số câu sai</p>
                <p className="text-xl font-bold">{analysisResult.detailExamResult.wrongAnswers}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Số câu bỏ trống</p>
                <p className="text-xl font-bold">{analysisResult.detailExamResult.emptyAnswers}</p>
              </div>
            </div>
          </div>
          
          {/* Phân tích theo chủ đề */}
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-3">Phân tích theo chủ đề</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Chủ đề
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Số câu
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Số câu đúng
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Số câu sai
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tỷ lệ đúng
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {analysisResult.topicAnalysis.map((topic, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {topic.topic}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {topic.questionCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {topic.correctCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {topic.wrongCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <div className="relative w-full h-4 bg-gray-200 rounded-full">
                            <div 
                              className="absolute top-0 left-0 h-4 bg-green-500 rounded-full"
                              style={{ width: `${topic.correctPercentage}%` }}
                            />
                          </div>
                          <span className="ml-2">{topic.correctPercentage}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Phân tích thời gian */}
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-3">Phân tích thời gian</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-indigo-50 p-4 rounded-lg">
                <p className="text-sm text-indigo-800">Tổng thời gian làm bài</p>
                <p className="text-xl font-bold">{analysisResult.workingTimeAnalysis.workingTime} phút</p>
              </div>
              <div className="bg-indigo-50 p-4 rounded-lg">
                <p className="text-sm text-indigo-800">Tốc độ trung bình</p>
                <p className="text-xl font-bold">{analysisResult.workingTimeAnalysis.averageSpeed.toFixed(2)} phút/câu</p>
              </div>
              <div className="bg-indigo-50 p-4 rounded-lg">
                <p className="text-sm text-indigo-800">Thời gian dành cho một câu</p>
                <p className="text-xl font-bold">{analysisResult.workingTimeAnalysis.timeSpent.toFixed(2)} phút</p>
              </div>
            </div>
          </div>
          
          {/* Điểm mạnh và điểm yếu */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <h3 className="text-lg font-medium mb-3 text-green-700">Điểm mạnh</h3>
              <ul className="list-disc pl-5 space-y-1">
                {analysisResult.strengths.length > 0 ? (
                  analysisResult.strengths.map((strength, index) => (
                    <li key={index} className="text-green-800">{strength}</li>
                  ))
                ) : (
                  <li className="text-gray-500">Chưa xác định được điểm mạnh</li>
                )}
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-3 text-red-700">Điểm yếu</h3>
              <ul className="list-disc pl-5 space-y-1">
                {analysisResult.weaknesses.length > 0 ? (
                  analysisResult.weaknesses.map((weakness, index) => (
                    <li key={index} className="text-red-800">{weakness}</li>
                  ))
                ) : (
                  <li className="text-gray-500">Chưa xác định được điểm yếu</li>
                )}
              </ul>
            </div>
          </div>
          
          {/* Gợi ý cải thiện */}
          <div className="space-y-8 mt-6">
            <AnalysisSection
              title="Phân tích thời gian"
              content={analysisResult.timeAnalysisSuggestions}
              bgColorClass="bg-purple-50"
              textColorClass="text-purple-800"
            />
            
            <AnalysisSection
              title="Phương pháp học tập"
              content={analysisResult.studyMethodSuggestions}
              bgColorClass="bg-green-50"
              textColorClass="text-green-800"
            />
            
            <AnalysisSection
              title="Gợi ý cho bài thi tiếp theo"
              content={analysisResult.nextExamSuggestions}
              bgColorClass="bg-yellow-50"
              textColorClass="text-yellow-800"
            />
            
            {analysisResult.historyScoreSuggestions && (
              <AnalysisSection
                title="Phân tích lịch sử điểm số"
                content={analysisResult.historyScoreSuggestions}
                bgColorClass="bg-indigo-50"
                textColorClass="text-indigo-800"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
} 