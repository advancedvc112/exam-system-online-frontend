import http from "./http";

export interface AnswerDTO {
  examRecordId: number;
  questionId: number;
  studentAnswer: string;
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

