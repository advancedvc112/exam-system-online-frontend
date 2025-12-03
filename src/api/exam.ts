import http from "./http";

export interface ExamDTO {
  id?: number;
  name: string;
  description?: string;
  paperId: number;
  startTime: string;
  endTime: string;
  duration?: number;
  status?: string;
  createUserId?: number;
  allowViewAnswer?: number;
  allowRetake?: number;
}

export interface ExamQueryDTO {
  status?: string;
  createUserId?: number;
  pageNum?: number;
  pageSize?: number;
}

export interface ExamPageDTO {
  list: ExamDTO[];
  total: number;
  pageNum: number;
  pageSize: number;
  totalPages: number;
}

export const createExam = async (payload: ExamDTO) => {
  const { data } = await http.post("/exam-online/manage/exam/create", payload);
  return data.data ?? data;
};

export const fetchExams = async (
  query: ExamQueryDTO
): Promise<ExamPageDTO> => {
  const { data } = await http.post("/exam-online/manage/exam/list", query);
  return data.data ?? data;
};

export const updateExamStatus = async (id: number) => {
  await http.put(`/exam-online/manage/exam/${id}/status`);
};

