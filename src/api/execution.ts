import http from "./http";

export interface AnswerDTO {
  examRecordId: number;
  questionId: number;
  studentAnswer: string;
}

export interface ExamRecordInfo {
  examRecordId: number;
  examId: number;
  paperId: number;
}

/**
 * 获取考试令牌（学生进入考试前需要先获取令牌）
 */
export const getExamToken = async (examId: number): Promise<string> => {
  const { data } = await http.get(`/exam-online/execute/token/${examId}`);
  return data.data ?? data;
};

/**
 * 保存答案（需要提供考试令牌）
 */
export const saveAnswer = async (payload: AnswerDTO, examToken: string) => {
  await http.post("/exam-online/execute/answer", payload, {
    headers: {
      "X-Exam-Token": examToken
    }
  });
};

export const fetchProgress = async (examRecordId: number) => {
  const { data } = await http.get(
    `/exam-online/execute/progress/${examRecordId}`
  );
  return data.data ?? data;
};

/**
 * 学生进入考试：后端会创建或返回考试记录ID
 * 需要提供考试令牌
 */
export const startExam = async (examId: number, examToken: string): Promise<number> => {
  const { data } = await http.post(
    `/exam-online/execute/start/${examId}`,
    {},
    {
      headers: {
        "X-Exam-Token": examToken
      }
    }
  );
  return data.data ?? data;
};

/**
 * 根据考试记录ID获取考试/试卷等基础信息
 */
export const fetchExamRecordInfo = async (
  examRecordId: number
): Promise<ExamRecordInfo> => {
  const { data } = await http.get(
    `/exam-online/execute/record/${examRecordId}`
  );
  return data.data ?? data;
};

/**
 * 考生提前结束考试（需要提供考试令牌）
 */
export const submitExam = async (examRecordId: number, examToken: string): Promise<void> => {
  await http.post(
    `/exam-online/execute/submit/${examRecordId}`,
    {},
    {
      headers: {
        "X-Exam-Token": examToken
      }
    }
  );
};

