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

export const saveAnswer = async (payload: AnswerDTO) => {
  await http.post("/exam-online/execute/answer", payload);
};

export const fetchProgress = async (examRecordId: number) => {
  const { data } = await http.get(
    `/exam-online/execute/progress/${examRecordId}`
  );
  return data.data ?? data;
};

/**
 * 学生进入考试：后端会创建或返回考试记录ID
 */
export const startExam = async (examId: number): Promise<number> => {
  const { data } = await http.post(`/exam-online/execute/start/${examId}`);
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

