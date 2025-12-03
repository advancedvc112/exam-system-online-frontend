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

/**
 * 手动同步某场考试的状态（视为“开启/结束考试”等操作）
 */
export const updateExamStatus = async (id: number) => {
  await http.put(`/exam-online/manage/exam/${id}/status`);
};

/**
 * 取消考试（删除安排）
 */
export const deleteExam = async (id: number) => {
  await http.delete(`/exam-online/manage/exam/${id}`);
};
