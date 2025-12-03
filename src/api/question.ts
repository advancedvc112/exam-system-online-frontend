import http from "./http";

export interface QuestionDTO {
  id?: number;
  content: string;
  type: string;
  difficulty: string;
  options?: string;
  answer: string;
  score: number;
  category?: string;
  status?: number;
}

export interface QuestionQuery {
  type?: string;
  difficulty?: string;
  category?: string;
  pageNum?: number;
  pageSize?: number;
}

export interface QuestionPage {
  list: QuestionDTO[];
  total: number;
  pageNum: number;
  pageSize: number;
  totalPages: number;
}

export const fetchQuestions = async (
  query: QuestionQuery
): Promise<QuestionPage> => {
  const { data } = await http.post("/exam-online/manage/question/list", query);
  return data.data ?? data;
};

export const createQuestion = async (payload: QuestionDTO) => {
  const { data } = await http.post("/exam-online/manage/question/add", payload);
  return data.data ?? data;
};

export const updateQuestion = async (payload: QuestionDTO) => {
  const { data } = await http.put("/exam-online/manage/question/update", payload);
  return data.data ?? data;
};

export const deleteQuestion = async (id: number) => {
  await http.delete(`/exam-online/manage/question/${id}`);
};

