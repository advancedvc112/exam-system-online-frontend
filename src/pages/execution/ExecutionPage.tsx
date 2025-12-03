import { useEffect, useRef, useState } from "react";
import { App, Button, Card, Input, Radio, Space, Tag, Typography } from "antd";
import SockJS from "sockjs-client";
import Stomp from "stompjs";
import {
  saveAnswer,
  fetchProgress,
  fetchExamRecordInfo
} from "../../api/execution";
import { WS_BASE_URL } from "../../config";
import { useLocation } from "react-router-dom";
import { getPaperById, PaperDTO, PaperQuestionDTO } from "../../api/paper";

export default function ExecutionPage() {
  const { message } = App.useApp();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialRecordId = searchParams.get("examRecordId");

  const [examRecordId, setExamRecordId] = useState<number | undefined>(
    initialRecordId && !Number.isNaN(Number(initialRecordId))
      ? Number(initialRecordId)
      : undefined
  );
  const [paper, setPaper] = useState<PaperDTO | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [progress, setProgress] = useState(0);
  const stompClient = useRef<Stomp.Client | null>(null);

  // 加载试卷题目
  useEffect(() => {
    const loadPaper = async () => {
      if (!examRecordId) return;
      try {
        const info = await fetchExamRecordInfo(examRecordId);
        const p = await getPaperById(info.paperId);
        setPaper(p);
      } catch (e: any) {
        const raw = e?.response?.data?.message ?? e?.message;
        message.error(
          typeof raw === "string" ? raw : "加载试卷失败"
        );
      }
    };
    loadPaper();
  }, [examRecordId]);

  // 建立 WebSocket 连接，监听进度和警告
  useEffect(() => {
    if (!examRecordId) return;

    const socket = new SockJS(`${WS_BASE_URL}/ws/exam`);
    const client = Stomp.over(socket);
    client.connect({}, () => {
      client.subscribe(`/topic/exam/progress/${examRecordId}`, (messageFrame) => {
        setProgress(Number(messageFrame.body));
      });
      client.subscribe(`/queue/exam/warning/${examRecordId}`, (msg) => {
        // 兜底处理：无论服务端推的是字符串还是对象，这里都只展示字符串，避免 React 尝试渲染对象
        let content: unknown = msg.body;
        try {
          // 如果是 JSON 字符串，尽量解析后取其中的 message 字段
          const parsed = JSON.parse(msg.body);
          content = (parsed && parsed.message) || msg.body;
        } catch {
          // 不是 JSON 就当普通字符串用
        }
        message.warning(typeof content === "string" ? content : "考试中检测到异常行为");
      });
    });
    stompClient.current = client;

    return () => {
      try {
        // 只有在实际建立连接后再去断开，避免 "connection has not been established" 错误
        if ((client as any).connected) {
          client.disconnect();
        }
      } catch {
        // 忽略断开过程中的异常
      } finally {
        stompClient.current = null;
      }
    };
  }, [examRecordId]);

  const sendHeartbeat = () => {
    if (!examRecordId) return;
    stompClient.current?.send(
      "/app/exam/heartbeat",
      {},
      JSON.stringify({ examRecordId, studentId: 1 })
    );
  };

  const currentQuestion: PaperQuestionDTO | undefined =
    paper?.questions && paper.questions[currentIndex];

  const parsedOptions: string[] | null = (() => {
    if (!currentQuestion?.question?.options) return null;
    try {
      const arr = JSON.parse(currentQuestion.question.options);
      return Array.isArray(arr) ? arr : null;
    } catch {
      return null;
    }
  })();

  const handleSaveAnswer = async (questionId: number, value: string) => {
    if (!examRecordId || !questionId || !value) {
      return;
    }
    await saveAnswer({ examRecordId, questionId, studentAnswer: value });
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    const currentProgress = await fetchProgress(examRecordId);
    setProgress(currentProgress);
  };

  const handleSwitch = () => {
    if (!examRecordId) return;
    stompClient.current?.send(
      "/app/exam/switch",
      {},
      JSON.stringify({ examRecordId, studentId: 1 })
    );
  };

  return (
    <Card title="考试答题">
      {!examRecordId ? (
        <Typography.Text type="warning">
          缺少考试记录ID，请从“考试安排”页点击“进入考试”进入本页面。
        </Typography.Text>
      ) : !paper ? (
        <Typography.Text>正在加载试卷...</Typography.Text>
      ) : !currentQuestion ? (
        <Typography.Text>本场试卷暂无题目。</Typography.Text>
      ) : (
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <Space style={{ justifyContent: "space-between", width: "100%" }}>
            <Tag color="blue">
              当前进度：第 {currentIndex + 1} / {paper.questions?.length ?? 0} 题
            </Tag>
            <Tag color="green">实时已答：{progress} 题</Tag>
            <Button onClick={sendHeartbeat}>发送心跳</Button>
            <Button danger onClick={handleSwitch}>模拟切屏</Button>
          </Space>

          <div>
            <Typography.Paragraph>
              <Typography.Text strong>
                第 {currentIndex + 1} 题（{currentQuestion.score} 分）
              </Typography.Text>
            </Typography.Paragraph>
            <Typography.Paragraph>
              {currentQuestion.question?.content}
            </Typography.Paragraph>

            {parsedOptions ? (
              <Radio.Group
                value={answers[currentQuestion.questionId]}
                onChange={async (e) => {
                  const val = e.target.value;
                  setAnswers((prev) => ({
                    ...prev,
                    [currentQuestion.questionId]: val
                  }));
                  await handleSaveAnswer(currentQuestion.questionId, val);
                }}
              >
                <Space direction="vertical">
                  {parsedOptions.map((opt, idx) => (
                    <Radio key={idx} value={opt}>
                      {opt}
                    </Radio>
                  ))}
                </Space>
              </Radio.Group>
            ) : (
              <Input.TextArea
                rows={4}
                placeholder="请输入本题答案"
                value={answers[currentQuestion.questionId] ?? ""}
                onChange={(e) => {
                  const val = e.target.value;
                  setAnswers((prev) => ({
                    ...prev,
                    [currentQuestion.questionId]: val
                  }));
                }}
              />
            )}
          </div>

          <Space>
            <Button
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((idx) => Math.max(0, idx - 1))}
            >
              上一题
            </Button>
            <Button
              disabled={!paper.questions || currentIndex >= paper.questions.length - 1}
              onClick={async () => {
                if (!paper.questions) return;
                const nextIndex = Math.min(
                  paper.questions.length - 1,
                  currentIndex + 1
                );

                // 在切换到下一题前，如果当前题有作答，则上传答案，不弹窗、不刷新整页
                const currentVal = answers[currentQuestion.questionId];
                if (currentVal) {
                  await handleSaveAnswer(currentQuestion.questionId, currentVal);
                }

                setCurrentIndex(nextIndex);
              }}
            >
              下一题
            </Button>
          </Space>
        </Space>
      )}
    </Card>
  );
}

