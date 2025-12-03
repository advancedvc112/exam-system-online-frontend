import http from "./http";
import type { QuestionDTO } from "./question";

export interface PaperQuestionDTO {
  questionId: number;
  orderNum?: number;
  score: number;
  // 后端现在会返回完整题目详情，便于前端直接展示
  question?: QuestionDTO;
}

export interface PaperDTO {
  id?: number;
  name: string;
  description?: string;
  type?: "random" | "fixed";
  totalScore?: number;
  duration: number;
  createUserId?: number;
  questions?: PaperQuestionDTO[];
}

export interface RandomRuleDTO {
  type?: string;
  difficulty?: string;
  category?: string;
  count: number;
  score?: number;
}

export interface RandomPaperDTO {
  name: string;
  description?: string;
  duration: number;
  createUserId?: number;
  rules: RandomRuleDTO[];
}

export const createRandomPaper = async (payload: RandomPaperDTO) => {
  const { data } = await http.post("/exam-online/manage/paper/random", payload);
  return data.data ?? data;
};

export const createFixedPaper = async (payload: PaperDTO) => {
  const { data } = await http.post("/exam-online/manage/paper/fixed", payload);
  return data.data ?? data;
};

// 列表接口：后端返回的是 PaperDTO[]，不包含题目明细（questions 为 null）
export const fetchPapers = async (pageNum = 1, pageSize = 10): Promise<PaperDTO[]> => {
  const { data } = await http.get("/exam-online/manage/paper/list", {
    params: { pageNum, pageSize }
  });
  return data.data ?? data;
};

// 按 ID 查询单份试卷详情（包含 questions 及 question 题目详情）
export const getPaperById = async (id: number): Promise<PaperDTO> => {
  const { data } = await http.get(`/exam-online/manage/paper/${id}`);
  return data.data ?? data;
};

