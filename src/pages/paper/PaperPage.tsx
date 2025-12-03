import {
  App,
  Button,
  Card,
  Col,
  Descriptions,
  Drawer,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Space,
  Table,
  Tabs,
  Tag
} from "antd";
import { useEffect, useState } from "react";
import {
  createFixedPaper,
  createRandomPaper,
  fetchPapers,
  getPaperById,
  PaperDTO,
  RandomPaperDTO
} from "../../api/paper";

const typeOptions = [
  { label: "单选题", value: "single_choice" },
  { label: "多选题", value: "multiple_choice" },
  { label: "判断题", value: "true_false" },
  { label: "填空题", value: "fill_blank" },
  { label: "简答题", value: "short_answer" }
];

const difficultyOptions = [
  { label: "简单", value: "easy" },
  { label: "中等", value: "medium" },
  { label: "困难", value: "hard" }
];

export default function PaperPage() {
  const { message } = App.useApp();
  const [data, setData] = useState<PaperDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [randomModalOpen, setRandomModalOpen] = useState(false);
  const [fixedModalOpen, setFixedModalOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [currentPaper, setCurrentPaper] = useState<PaperDTO | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [randomForm] = Form.useForm<RandomPaperDTO>();
  const [fixedForm] = Form.useForm<PaperDTO>();

  const loadData = async () => {
    setLoading(true);
    try {
      const list = await fetchPapers(1, 20);
      // 列表接口只返回基本信息（questions 为 null），直接用于表格展示
      setData(list);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const columns = [
    { title: "试卷名称", dataIndex: "name" },
    {
      title: "类型",
      dataIndex: "type",
      render: (type: string) =>
        type === "random" ? <Tag color="blue">随机组卷</Tag> : <Tag color="green">固定组卷</Tag>
    },
    { title: "总分", dataIndex: "totalScore" },
    { title: "考试时长/分钟", dataIndex: "duration" },
    // 列表接口不带题目明细，这里先不展示题目数量，避免误导，可以后续在详情中查看
    {
      title: "操作",
      render: (_: unknown, record: PaperDTO) => (
        <Button
          type="link"
          onClick={async () => {
            setDetailOpen(true);
            setDetailLoading(true);
            try {
              // 通过 ID 再查一次详细信息（包含 questions + question 详情）
              const detail = await getPaperById(record.id!);
              setCurrentPaper(detail);
            } finally {
              setDetailLoading(false);
            }
          }}
        >
          查看题目
        </Button>
      )
    }
  ];

  const handleRandomSubmit = async () => {
    const values = await randomForm.validateFields();
    await createRandomPaper(values);
    message.success("随机组卷成功");
    setRandomModalOpen(false);
    randomForm.resetFields();
    loadData();
  };

  const handleFixedSubmit = async () => {
    const values = await fixedForm.validateFields();
    await createFixedPaper({
      ...values,
      questions: values.questions?.filter((q) => q.questionId && q.score)
    });
    message.success("固定组卷成功");
    setFixedModalOpen(false);
    fixedForm.resetFields();
    loadData();
  };

  return (
    <Card
      title="试卷管理"
      extra={
        <Space>
          <Button onClick={() => setRandomModalOpen(true)}>随机组卷</Button>
          <Button type="primary" onClick={() => setFixedModalOpen(true)}>
            固定组卷
          </Button>
        </Space>
      }
    >
      <Table rowKey="id" loading={loading} dataSource={data} columns={columns} />

      <Modal
        title="随机组卷"
        open={randomModalOpen}
        onCancel={() => setRandomModalOpen(false)}
        onOk={handleRandomSubmit}
        width={820}
      >
        <Form form={randomForm} layout="vertical">
          <Form.Item
            name="name"
            label="试卷名称"
            rules={[{ required: true, message: "请输入试卷名称" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="duration"
            label="考试时长（分钟）"
            rules={[{ required: true, message: "请输入考试时长" }]}
          >
            <InputNumber min={30} style={{ width: "100%" }} />
          </Form.Item>
          <Tabs
            items={(randomForm.getFieldValue("rules") ?? [0]).map(
              (_: unknown, index: number) => ({
                key: index.toString(),
                label: `规则 ${index + 1}`,
                children: (
                  <Row gutter={16}>
                    <Col span={8}>
                      <Form.Item
                        name={["rules", index, "type"]}
                        label="题型"
                        rules={[{ required: true }]}
                      >
                        <Select options={typeOptions} />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        name={["rules", index, "difficulty"]}
                        label="难度"
                        rules={[{ required: true }]}
                      >
                        <Select options={difficultyOptions} />
                      </Form.Item>
                    </Col>
                    <Col span={4}>
                      <Form.Item
                        name={["rules", index, "count"]}
                        label="数量"
                        rules={[{ required: true }]}
                      >
                        <InputNumber min={1} style={{ width: "100%" }} />
                      </Form.Item>
                    </Col>
                    <Col span={4}>
                      <Form.Item
                        name={["rules", index, "score"]}
                        label="每题分值"
                        rules={[{ required: true }]}
                      >
                        <InputNumber min={1} style={{ width: "100%" }} />
                      </Form.Item>
                    </Col>
                  </Row>
                )
              })
            )}
            type="editable-card"
            onEdit={(targetKey, action) => {
              const rules = randomForm.getFieldValue("rules") ?? [];
              if (action === "add") {
                randomForm.setFieldsValue({
                  rules: [
                    ...rules,
                    { type: undefined, difficulty: undefined, count: 1, score: 5 }
                  ]
                });
              } else if (action === "remove") {
                randomForm.setFieldsValue({
                  rules: rules.filter((_v: unknown, idx: number) => idx.toString() !== targetKey)
                });
              }
            }}
          />
        </Form>
      </Modal>

      <Modal
        title="固定组卷"
        open={fixedModalOpen}
        onCancel={() => setFixedModalOpen(false)}
        onOk={handleFixedSubmit}
        width={820}
      >
        <Form form={fixedForm} layout="vertical">
          <Form.Item
            name="name"
            label="试卷名称"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="duration"
            label="考试时长（分钟）"
            rules={[{ required: true }]}
          >
            <InputNumber min={30} style={{ width: "100%" }} />
          </Form.Item>
          <Form.List name="questions" initialValue={[{}]}>
            {(fields, { add, remove }) => (
              <>
                {fields.map((field) => (
                  <Row gutter={16} key={field.key} align="middle">
                    <Col span={10}>
                      <Form.Item
                        {...field}
                        name={[field.name, "questionId"]}
                        label="题目ID"
                        rules={[{ required: true, message: "请输入题目ID" }]}
                      >
                        <InputNumber min={1} style={{ width: "100%" }} />
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item
                        {...field}
                        name={[field.name, "score"]}
                        label="分值"
                        rules={[{ required: true }]}
                      >
                        <InputNumber min={1} style={{ width: "100%" }} />
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item
                        {...field}
                        name={[field.name, "orderNum"]}
                        label="排序"
                      >
                        <InputNumber min={1} style={{ width: "100%" }} />
                      </Form.Item>
                    </Col>
                    <Col span={2}>
                      <Button danger type="link" onClick={() => remove(field.name)}>
                        删除
                      </Button>
                    </Col>
                  </Row>
                ))}
                <Button type="dashed" block onClick={() => add()}>
                  添加题目
                </Button>
              </>
            )}
          </Form.List>
        </Form>
      </Modal>

      <Drawer
        title={currentPaper ? `试卷：${currentPaper.name}` : "试卷详情"}
        open={detailOpen}
        width={720}
        onClose={() => setDetailOpen(false)}
        destroyOnClose
      >
        {detailLoading && <p>加载中...</p>}
        {!detailLoading && currentPaper && (
          <>
            <Descriptions column={2} bordered size="small" style={{ marginBottom: 16 }}>
              <Descriptions.Item label="类型">
                {currentPaper.type === "random" ? "随机组卷" : "固定组卷"}
              </Descriptions.Item>
              <Descriptions.Item label="总分">
                {currentPaper.totalScore}
              </Descriptions.Item>
              <Descriptions.Item label="考试时长（分钟）">
                {currentPaper.duration}
              </Descriptions.Item>
              <Descriptions.Item label="题目数量">
                {currentPaper.questions?.length ?? 0}
              </Descriptions.Item>
            </Descriptions>

            <Table
              rowKey={(q) => `${q.questionId}-${q.orderNum}`}
              dataSource={currentPaper.questions ?? []}
              pagination={false}
              columns={[
                {
                  title: "序号",
                  dataIndex: "orderNum",
                  width: 60
                },
                {
                  title: "题目内容",
                  render: (_: unknown, record) => record.question?.content ?? "-"
                },
                {
                  title: "题型",
                  render: (_: unknown, record) => record.question?.type ?? "-"
                },
                {
                  title: "难度",
                  render: (_: unknown, record) => record.question?.difficulty ?? "-"
                },
                {
                  title: "知识点/分类",
                  render: (_: unknown, record) => record.question?.category ?? "-"
                },
                {
                  title: "分值",
                  dataIndex: "score",
                  width: 80
                }
              ]}
            />
          </>
        )}
      </Drawer>
    </Card>
  );
}

