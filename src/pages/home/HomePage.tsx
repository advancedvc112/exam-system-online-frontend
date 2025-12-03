import { Card, Col, Row, Statistic } from "antd";
import { useEffect, useState } from "react";
import { fetchQuestions } from "../../api/question";
import { fetchPapers } from "../../api/paper";
import { fetchExams } from "../../api/exam";

export default function HomePage() {
  const [stats, setStats] = useState({
    questions: 0,
    papers: 0,
    exams: 0
  });

  useEffect(() => {
    (async () => {
      const [questionPage, paperPage, examPage] = await Promise.all([
        fetchQuestions({ pageNum: 1, pageSize: 1 }),
        fetchPapers(1, 1),
        fetchExams({ pageNum: 1, pageSize: 1 })
      ]);
      setStats({
        questions: questionPage.total,
        papers: paperPage.total,
        exams: examPage.total
      });
    })();
  }, []);

  return (
    <Row gutter={[24, 24]}>
      <Col span={8}>
        <Card>
          <Statistic title="题目数量" value={stats.questions} />
        </Card>
      </Col>
      <Col span={8}>
        <Card>
          <Statistic title="试卷数量" value={stats.papers} />
        </Card>
      </Col>
      <Col span={8}>
        <Card>
          <Statistic title="考试场次" value={stats.exams} />
        </Card>
      </Col>
    </Row>
  );
}

