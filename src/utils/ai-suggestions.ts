import { TopicAnalysis } from "@/types/analysis";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";

export async function generateAISuggestions(
  subject: string,
  score: number,
  averageSpeed: number,
  timeSpent: number,
  strengths: string[],
  weaknesses: string[],
  topicAnalysis: TopicAnalysis[],
  historyScore: number[],
  historyWorkingTime: number[],
  historyQuestionLabels: { topic: string; correctPercentage: number }[][],
): Promise<{
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  inputCost: number;
  outputCost: number;
  totalCost: number;
  improvementSuggestions: string;
  timeAnalysisSuggestions: string;
  studyMethodSuggestions: string;
  nextExamSuggestions: string;
  historyScoreSuggestions: string;
  historyWorkingTimeSuggestions: string;
  historyQuestionLabels: string;
}> {
  try {
    const prompt = getPrompt(subject, score, averageSpeed, timeSpent, strengths, weaknesses, topicAnalysis, historyScore, historyWorkingTime, historyQuestionLabels);
    const result = await generateText({
      model: google("gemini-1.5-pro-latest"),
      prompt,
    });

    const response = result;
    const text = response.text;

    let parsedResponse;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Không tìm thấy JSON hợp lệ trong phản hồi");
      }
    } catch (parseError) {
      console.error("Error parsing JSON response:", parseError);
      const sections = text.split(/\d\.\s+/);

      parsedResponse = {
        improvementSuggestions: sections[1]?.trim() || "",
        timeAnalysisSuggestions: sections[2]?.trim() || "",
        studyMethodSuggestions: sections[3]?.trim() || "",
        nextExamSuggestions: sections[4]?.trim() || "",
        historyScoreSuggestions:
          historyScore.length > 0 ? sections[5]?.trim() : "",
        historyWorkingTimeSuggestions:
          historyWorkingTime.length > 0 ? sections[6]?.trim() : "",
        historyQuestionLabels:
          historyQuestionLabels.length > 0 ? sections[7]?.trim() : "",
      };
    }

    const countTokens = response.usage.promptTokens || 0;
    const outputTokens = response.usage.completionTokens || 0;
    const totalTokens = response.usage.totalTokens || 0;

    const inputCost = (countTokens * 0.0025) / 1000;
    const outputCost = (outputTokens * 0.0075) / 1000;
    const totalCost = inputCost + outputCost;

    return {
      inputTokens: countTokens,
      outputTokens: outputTokens,
      totalTokens: totalTokens,
      inputCost: inputCost,
      outputCost: outputCost,
      totalCost: totalCost,
      improvementSuggestions: parsedResponse.improvementSuggestions || "",
      timeAnalysisSuggestions: parsedResponse.timeAnalysisSuggestions || "",
      studyMethodSuggestions: parsedResponse.studyMethodSuggestions || "",
      nextExamSuggestions: parsedResponse.nextExamSuggestions || "",
      historyScoreSuggestions:
        historyScore.length > 0
          ? parsedResponse.historyScoreSuggestions || ""
          : "",
      historyWorkingTimeSuggestions:
        historyWorkingTime.length > 0
          ? parsedResponse.historyWorkingTimeSuggestions || ""
          : "",
      historyQuestionLabels:
        historyQuestionLabels.length > 0
          ? parsedResponse.historyQuestionLabels || ""
          : "",
    };
  } catch (error) {
    console.error("Error generating AI suggestions:", error);
    return {
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
      inputCost: 0,
      outputCost: 0,
      totalCost: 0,
      improvementSuggestions: "",
      timeAnalysisSuggestions: "",
      studyMethodSuggestions: "",
      nextExamSuggestions: "",
      historyScoreSuggestions: "",
      historyWorkingTimeSuggestions: "",
      historyQuestionLabels: "",
    };
  }
}

const getPrompt = (
  subject: string,
  score: number,
  averageSpeed: number,
  timeSpent: number,
  strengths: string[],
  weaknesses: string[],
  topicAnalysis: TopicAnalysis[],
  historyScore: number[],
  historyWorkingTime: number[],
  historyQuestionLabels: { topic: string; correctPercentage: number }[][]
): string => {
  const prompt = `
    Vai trò: Bạn là một trợ lý AI giáo dục, phân tích bài kiểm tra để đưa ra khuyến nghị học tập cá nhân hóa.

    Yêu cầu:

    Ngôn ngữ: Tiếng Việt
    Định dạng: JSON hợp lệ theo cấu trúc dưới đây
    Markdown: Sử dụng để làm rõ nội dung
    Dữ liệu đầu vào:

      Môn học: ${subject}
      Điểm tổng thể: ${score}/10
      Tốc độ trung bình của bài thi: ${averageSpeed} giây/câu
      Tốc độ trung bình của bạn: ${timeSpent} giây
      Điểm mạnh: ${strengths.join(", ")}
      Điểm yếu: ${weaknesses.join(", ")}
      Danh sách chủ đề và phần trăm đúng: ${topicAnalysis.map((t) => `${t.topic} ${t.correctPercentage}%`).join(", ")}
      Điểm số trước đó: ${historyScore.length > 0 ? historyScore.join(", ") : "Không có"}
      Thời gian làm bài trước đó: ${historyWorkingTime.length > 0 ? historyWorkingTime.join(", ") : "Không có"}
      Danh sách chủ đề và phần trăm đúng trước đó (theo từng bài kiểm tra từ gần đây nhất đến xa nhất): ${historyQuestionLabels
        .map(
          (examTopics, examIndex) =>
            `   - Bài kiểm tra ${
              historyQuestionLabels.length - examIndex
            }: ${examTopics
              .map(topic => `${topic.topic} ${topic.correctPercentage}%`)
              .join(", ")}`
        )
        .join("\n")}
    Khuyến nghị cần có:

      1. Cải thiện điểm số (Gợi ý tài liệu, bài tập, khóa học)
      2. Đánh giá thời gian làm bài
        Tốc độ & mức độ chính xác
        Xu hướng thay đổi giữa các lần thi
      3. Phương pháp học tập theo chủ đề yếu
      4. Gợi ý bài kiểm tra tiếp theo
      5. Phân tích sự tiến bộ (so sánh điểm số, thời gian, chủ đề)

    JSON output format:
    {
      "improvementSuggestions": "## Điểm mạnh\n...\n## Điểm yếu\n...\n## Đề xuất cải thiện\n...",
      "timeAnalysisSuggestions": "## Phân tích thời gian\n...",
      "studyMethodSuggestions": "- Phương pháp 1\n- Phương pháp 2\n...",
      "nextExamSuggestions": "## Bài kiểm tra tiếp theo\n...",
      "historyScoreSuggestions": "## Xu hướng điểm số\n...",
      "historyWorkingTimeSuggestions": "## Xu hướng thời gian làm bài\n...",
      "historyQuestionLabels": "- Chủ đề: Hình học 66,66% bài hiện tại so với các lần làm đề thi trước đó có tăng rõ rệt, cụ thể trả lời đúng nhiều hơn,...........v.v \n- Chủ đề: Đại số 10% bài hiện tại so với các lần làm đề thi trước đó có giảm, cụ thể trả lời đúng ít hơn,...........v.v"
    }
    Yêu cầu Markdown:

    Headings (##, ###)
    Danh sách (số thứ tự, bullet points)
    Nhấn mạnh (bold, italic)
    Bảng nếu cần thiết
    Quotes để làm nổi bật nội dung quan trọng
    Lưu ý:

    Escape ký tự Markdown đúng cách để JSON hợp lệ
    Đảm bảo JSON có thể phân tích cú pháp (parse) mà không lỗi
  `;
  return prompt;
};
