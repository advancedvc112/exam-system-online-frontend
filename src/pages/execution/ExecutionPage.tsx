import { useEffect, useRef, useState } from "react";
import { Button, Card, Input, InputNumber, Space, Table, Tag, message } from "antd";
import SockJS from "sockjs-client";
import Stomp from "stompjs";
import { saveAnswer, fetchProgress } from "../../api/execution";
import { WS_BASE_URL } from "../../config";

interface AnswerRow {
  questionId: number;
  answer: string;
}

export default function ExecutionPage() {
  const [examRecordId, setExamRecordId] = useState<number>();
  const [questionId, setQuestionId] = useState<number>();
  const [answer, setAnswer] = useState("");
  const [answers, setAnswers] = useState<AnswerRow[]>([]);
  const [progress, setProgress] = useState(0);
  const stompClient = useRef<Stomp.Client | null>(null);

  useEffect(() => {
    if (!examRecordId) {
      return;
    }

    const socket = new SockJS(`${WS_BASE_URL}/ws/exam`);
    const client = Stomp.over(socket);
    client.connect({}, () => {
      client.subscribe(`/topic/exam/progress/${examRecordId}`, (message) => {
        setProgress(Number(message.body));
      });
      client.subscribe(`/queue/exam/warning/${examRecordId}`, (msg) => {
        message.warning(msg.body);
      });
    });
    stompClient.current = client;

    return () => {
      client.disconnect();
      stompClient.current = null;
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

  const handleSaveAnswer = async () => {
    if (!examRecordId || !questionId || !answer) {
      message.warning("请填写完整");
      return;
    }
    await saveAnswer({ examRecordId, questionId, studentAnswer: answer });
    message.success("答案已保存");
    setAnswers((prev) => [...prev, { questionId, answer }]);
    setAnswer("");
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

  const columns = [
    { title: "题目ID", dataIndex: "questionId" },
    { title: "答案", dataIndex: "answer" }
  ];

  return (
    <Card title="考试执行与防作弊监控">
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Space>
          <InputNumber
            placeholder="考试记录ID"
            value={examRecordId}
            onChange={(value) => setExamRecordId(value ?? undefined)}
          />
          <Button onClick={sendHeartbeat} disabled={!examRecordId}>
            发送心跳
          </Button>
          <Button danger onClick={handleSwitch} disabled={!examRecordId}>
            模拟切屏
          </Button>
          <Tag color="blue">实时进度：已答 {progress} 题</Tag>
        </Space>

        <Space>
          <InputNumber
            placeholder="题目ID"
            value={questionId}
            onChange={(value) => setQuestionId(value ?? undefined)}
          />
          <Input
            placeholder="答案"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            style={{ width: 240 }}
          />
          <Button type="primary" onClick={handleSaveAnswer} disabled={!examRecordId}>
            保存答案
          </Button>
        </Space>

        <Table rowKey="questionId" dataSource={answers} columns={columns} pagination={false} />
      </Space>
    </Card>
  );
}

