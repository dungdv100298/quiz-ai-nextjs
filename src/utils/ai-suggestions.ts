import { TopicAnalysis } from "@/types/analysis";
import { google } from "@ai-sdk/google";
import { generateText } from "ai";

const RESPONSE_DEFAULT = {
  inputTokens: 0,
  outputTokens: 0,
  totalTokens: 0,
  inputCost: 0,
  outputCost: 0,
  totalCost: 0,
  strengthsAnalysis: "",
  weaknessesAnalysis: "",
  improvementSuggestions: "",
  timeAnalysisSuggestions: "",
  studyMethodSuggestions: "",
  nextExamSuggestions: "",
  historyScoreSuggestions: "",
  historyWorkingTimeSuggestions: "",
  historyQuestionLabels: "",
};

export async function generateAISuggestions(
  subject: string,
  score: number,
  averageSpeed: number,
  timeSpent: number,
  strengths: string[],
  weaknesses: string[],
  topicAnalysis: TopicAnalysis[],
  historyScore: { score: number; attemptNumber: number }[],
  historyWorkingTime: { timeSpent: number; attemptNumber: number }[],
  historyQuestionLabels: string,
  language: "vi" | "en" = "vi"
): Promise<{
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  inputCost: number;
  outputCost: number;
  totalCost: number;
  strengthsAnalysis: string;
  weaknessesAnalysis: string;
  improvementSuggestions: string;
  timeAnalysisSuggestions: string;
}> {
  try {
    const prompt = getPrompt(
      subject,
      score,
      averageSpeed,
      timeSpent,
      strengths,
      weaknesses,
      topicAnalysis,
      historyScore,
      historyWorkingTime,
      historyQuestionLabels,
      language
    );
    const result = await generateText({
      model: google(
        process.env.NEXT_PUBLIC_MODEL_NAME || "gemini-1.5-pro-latest"
      ),
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
        strengthsAnalysis: sections[1]?.trim() || "",
        weaknessesAnalysis: sections[2]?.trim() || "",
        improvementSuggestions: sections[3]?.trim() || "",
        timeAnalysisSuggestions: sections[4]?.trim() || "",
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
      strengthsAnalysis: parsedResponse.strengthsAnalysis || "",
      weaknessesAnalysis: parsedResponse.weaknessesAnalysis || "",
      improvementSuggestions: parsedResponse.improvementSuggestions || "",
      timeAnalysisSuggestions: parsedResponse.timeAnalysisSuggestions || "",
    };
  } catch (error) {
    console.error("Error generating AI suggestions:", error);
    return RESPONSE_DEFAULT;
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
  historyScore: { score: number; attemptNumber: number }[],
  historyWorkingTime: { timeSpent: number; attemptNumber: number }[],
  historyQuestionLabels: string,
  language: "vi" | "en" = "vi"
): string => {
  const timeDifference = timeSpent - averageSpeed;
  const timeDifferencePercentage = (
    (timeDifference / averageSpeed) *
    100
  ).toFixed(2);
  const timeDifferencePercentageAbs = Math.abs(
    Number(timeDifferencePercentage)
  );
  const topicAndCorrectPercentageString = topicAnalysis
    .map((item) => `${item.topic} ${item.correctPercentage}%`)
    .join(", ");
  const historyScoreString = historyScore
    .map((item) => `Lần thi ${item.attemptNumber}: ${item.score}/10`)
    .join(", ");
  const historyWorkingTimeString = historyWorkingTime
    .map((item) => `Lần thi ${item.attemptNumber}: ${item.timeSpent}s`)
    .join(", ");
  const historyQuestionLabelsString =
    historyQuestionLabels +
    ", Lần hiện tại: " +
    topicAndCorrectPercentageString;

  const timeAnalysisSuggestionsRules =
    historyWorkingTime.length > 0
      ? 'Đưa ra % chênh lệch thời gian từ input (đánh giá nhanh hay chậm). Phân tích xu hướng thời gian làm bài của bạn trên câu với lần nhanh nhất và lần chậm nhất'
      : 'Đưa ra % chênh lệch thời gian từ input (đánh giá nhanh hay chậm). liệt kê chủ đề yếu xong nhận xét';

  const strengthsAnalysisRules =
    historyQuestionLabels.length > 0
      ? 'Liệt kê chi tiết từng chủ đề mạnh và đánh giá xu hướng LẦN HIỆN TẠI VỚI LẦN THI THẤP NHẤT VÀ CAO NHẤT. ĐƯA RA DẪN CHỨNG CỤ THỂ VỀ LẦN THI VÀ % ĐÚNG, TUYỆT ĐỐI KHÔNG LIỆT KÊ ĐIỂM MẠNH DƯỚI 80% ĐÚNG VÀ QUÁ 3 CHỦ ĐỀ'
      : 'Nhận xét điểm mạnh (highlight chủ đề mạnh) TUYỆT ĐỐI KHÔNG LIỆT KÊ CHỦ ĐỀ DƯỚI 80% ĐÚNG VÀ QUÁ 3 CHỦ ĐỀ.';

  const weaknessesAnalysisRules =
    historyQuestionLabels.length > 0
      ? 'Liệt kê chi tiết từng chủ đề yếu và đánh giá xu hướng LẦN HIỆN TẠI VỚI LẦN THI THẤP NHẤT VÀ CAO NHẤT. ĐƯA RA DẪN CHỨNG CỤ THỂ VỀ LẦN THI VÀ % ĐÚNG, TUYỆT ĐỐI KHÔNG LIỆT KÊ ĐIỂM YẾU DƯỚI 80% ĐÚNG VÀ QUÁ 3 CHỦ ĐỀ'
      : 'Chỉ đưa ra tổng số chủ đề yếu từ input và nhận xét tổng quát, TUYỆT ĐỐI KHÔNG liệt kê từng chủ đề yếu cụ thể.';

  if (language === "vi") {
    const promptVi = `
    Vai trò: Trợ lý AI giáo dục phân tích bài kiểm tra và đưa ra khuyến nghị học tập

    Dữ liệu đầu vào:
      Môn học: ${subject}
      Điểm: ${score}/10
      Tốc độ trung bình làm mỗi câu: ${averageSpeed}s/câu
      Tốc độ trung bình làm mỗi câu của bạn (lần thi hiên tại): ${timeSpent}s/câu
      % chênh lệch thời gian: ${timeDifferencePercentageAbs}%
      Điểm mạnh: ${strengths.length > 0 ? strengths.join(", ") : "Không có"}
      Điểm yếu: ${weaknesses.length > 0 ? weaknesses.join(", ") : "Không có"}
      Tổng số chủ đề yếu: ${weaknesses.length}
      Nguồn học tập và thực hành: 'EduQuiz Study'
      ${ historyQuestionLabels.length > 0 ? '' : 'Chủ đề và % đúng: ' + topicAndCorrectPercentageString }
      ${historyScore.length > 0 ? 'Điểm số trước: ' + historyScoreString : ''}
      ${historyWorkingTime.length > 0 ? 'Tốc độ trung bình làm mỗi câu của các bài thi trước: ' + historyWorkingTimeString : ''}
      ${ historyQuestionLabels.length > 0 ? 'Chủ đề và % đúng trước đây: ' + historyQuestionLabelsString : ''}

    Trả về JSON hợp lệ với định dạng sau:
    {
      // Định dạng output mong muốn:

      "strengthsAnalysis": "[nội dung]",
      "weaknessesAnalysis": "[nội dung]",
      "improvementSuggestions": "[nội dung]",
      "timeAnalysisSuggestions": "[nội dung]",
    }

    Hướng dẫn:
    - Viết bằng tiếng Việt, sử dụng Markdown (##, danh sách, **bold**, *italic*)
    - Đảm bảo JSON hợp lệ, tránh lỗi parsing
    - Chủ đề dưới 80% đúng: là yếu
    - Chủ đề trên 80% đúng: là mạnh
    - giá trị Tốc độ trung bình của một câu CÀNG THẤP LÀ CÀNG NHANH, CÀNG CAO LÀ CÀNG CHẬM ví dụ: 10s/câu là nhanh hơn 20s/câu
    - Chủ đề và % đúng: Giá trị cao hơn là cải thiện/tiến bộ, giá trị thấp hơn là giảm/cần cải thiện ví dụ: Lần 1: 20 % đúng, Lần 2: 50% => Đang cải thiện. Lần 1: 50%, Lần 2: 20% => Đang giảm, chưa lắm vững kiến thức
    - Thời gian trung bình của một câu CÀNG THẤP LÀ CÀNG NHANH, CÀNG CAO LÀ CÀNG CHẬM
    - KHÔNG DÙNG TỪ "ĐIỂM YẾU" MÀ THAY VÀO LÀ "ĐIỂM CẦN CẢI THIỆN"
    - KHÔNG DÙNG TỪ "EM" MÀ THAY VÀO LÀ "BẠN"

    Yêu cầu chi tiết cho từng mục:
    - improvementSuggestions: Bắt đầu với nhận xét tổng quan về kết quả, sau đó đề xuất mục tiêu điểm số cụ thể cho lần thi tiếp theo, sau đó liệt kê theo ý sau
       + Xác định trọng tâm học tập (Dựa trên kết quả hiện tại và các chủ đề ưu tiên)
       + Phương pháp học tập hiệu quả
       + Luyện tập thực tế củng cố kiến thức
       + Lập kế hoạch học tập khoa học
    - timeAnalysisSuggestions: ${timeAnalysisSuggestionsRules}
    - strengthsAnalysis: ${strengthsAnalysisRules}
    - weaknessesAnalysis: ${weaknessesAnalysisRules}
  `;
    return promptVi;
  } else {
    const promptEn = `
    Role: You are an AI education assistant, analyzing test results to provide personalized learning recommendations.

    Requirements:

    Language: English
    Format: Valid JSON in the following structure
    Markdown: Use to clarify content
    Input data:

    Subject: ${subject}
    Total score: ${score}/10
    Average speed of the test: ${averageSpeed} seconds/question
    Average speed of you: ${timeSpent} seconds
    Strengths: ${strengths.join(", ")}
    Weaknesses: ${weaknesses.join(", ")}
    Topic analysis: ${topicAnalysis
      .map((t) => `${t.topic} ${t.correctPercentage}%`)
      .join(", ")}
    Previous scores: ${
      historyScore.length > 0 ? historyScore.join(", ") : "No previous scores"
    }
    Previous working times: ${
      historyWorkingTime.length > 0
        ? historyWorkingTime.join(", ")
        : "No previous working times"
    }
    Previous topic analysis: ${historyQuestionLabels}

    Recommendations needed:

    1. Improve score (Suggestions for materials, exercises, courses)
    2. Time analysis
    Speed & accuracy
    Change trend between tests
    
    JSON output format:
    {
      "improvementSuggestions": "## Strengths\n...\n## Weaknesses\n...\n## Improvement suggestions\n...",
      "timeAnalysisSuggestions": "## Time analysis\n...",
      "studyMethodSuggestions": "- Method 1\n- Method 2\n...",
      "nextExamSuggestions": "## Next exam\n...",
      "historyScoreSuggestions": "## Score trend\n...",
      "historyWorkingTimeSuggestions": "## Working time trend\n...",
      "historyQuestionLabels": "- Topic: Geometry 66.66% current compared to previous tests has increased sharply, specifically answering correctly more,...........v.v \n- Topic: Algebra 10% current compared to previous tests has decreased, specifically answering correctly less,...........v.v"
    }
    Markdown requirements:

    Headings (##, ###)
    Lists (numbered, bullet points)
    Emphasis (bold, italic)
    Tables if needed
    Quotes to highlight important content
    Note:

    Escape Markdown characters correctly to ensure valid JSON
    Ensure JSON can be parsed without errors
    `;
    return promptEn;
  }
};
