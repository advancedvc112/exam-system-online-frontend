import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  message
} from "antd";
import {
  createQuestion,
  deleteQuestion,
  fetchQuestions,
  QuestionDTO,
  updateQuestion
} from "../../api/question";

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

export default function QuestionPage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<QuestionDTO[]>([]);
  const [pagination, setPagination] = useState({
    pageNum: 1,
    pageSize: 10,
    total: 0
  });
  const [filters, setFilters] = useState<{
    type?: string;
    difficulty?: string;
    category?: string;
  }>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm<QuestionDTO>();

  const columns = useMemo(
    () => [
      { title: "题目内容", dataIndex: "content", ellipsis: true },
      {
        title: "题型",
        dataIndex: "type",
        render: (value: string) => typeOptions.find((o) => o.value === value)?.label
      },
      {
        title: "难度",
        dataIndex: "difficulty",
        render: (value: string) => (
          <Tag
            color={value === "easy" ? "green" : value === "medium" ? "blue" : "red"}
          >
            {difficultyOptions.find((o) => o.value === value)?.label}
          </Tag>
        )
      },
      { title: "分值", dataIndex: "score", width: 80 },
      {
        title: "操作",
        dataIndex: "actions",
        width: 160,
        render: (_: unknown, record: QuestionDTO) => (
          <Space>
            <Button
              size="small"
              onClick={() => {
                form.setFieldsValue(record);
                setModalOpen(true);
              }}
            >
              编辑
            </Button>
            <Button
              danger
              size="small"
              onClick={async () => {
                await deleteQuestion(record.id!);
                message.success("删除成功");
                loadData();
              }}
            >
              删除
            </Button>
          </Space>
        )
      }
    ],
    [form]
  );

  const loadData = async (pageNum = pagination.pageNum) => {
    setLoading(true);
    try {
      const page = await fetchQuestions({
        ...filters,
        pageNum,
        pageSize: pagination.pageSize
      });
      setData(page.list);
      setPagination({
        pageNum: page.pageNum,
        pageSize: page.pageSize,
        total: page.total
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleSubmit = async () => {
    const values = await form.validateFields();
    if (values.id) {
      await updateQuestion(values);
    } else {
      await createQuestion(values);
    }
    message.success("保存成功");
    setModalOpen(false);
    form.resetFields();
    loadData();
  };

  return (
    <Card
      title="题库管理"
      extra={
        <Button type="primary" onClick={() => setModalOpen(true)}>
          新增题目
        </Button>
      }
    >
      <Space style={{ marginBottom: 16 }}>
        <Select
          allowClear
          placeholder="题型"
          options={typeOptions}
          style={{ width: 140 }}
          onChange={(value) => setFilters((prev) => ({ ...prev, type: value }))}
        />
        <Select
          allowClear
          placeholder="难度"
          options={difficultyOptions}
          style={{ width: 140 }}
          onChange={(value) =>
            setFilters((prev) => ({ ...prev, difficulty: value }))
          }
        />
        <Input
          placeholder="分类/关键字"
          allowClear
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, category: e.target.value }))
          }
        />
      </Space>
      <Table
        rowKey="id"
        loading={loading}
        dataSource={data}
        columns={columns}
        pagination={{
          current: pagination.pageNum,
          pageSize: pagination.pageSize,
          total: pagination.total,
          onChange: (page) => loadData(page)
        }}
      />
      <Modal
        title={form.getFieldValue("id") ? "编辑题目" : "新增题目"}
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          form.resetFields();
        }}
        onOk={handleSubmit}
        width={720}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="id" hidden>
            <Input />
          </Form.Item>
          <Form.Item
            name="content"
            label="题目内容"
            rules={[{ required: true, message: "请输入题目内容" }]}
          >
            <Input.TextArea rows={3} placeholder="题目描述" />
          </Form.Item>
          <Space size="large">
            <Form.Item
              name="type"
              label="题型"
              rules={[{ required: true, message: "请选择题型" }]}
            >
              <Select options={typeOptions} style={{ width: 200 }} />
            </Form.Item>
            <Form.Item
              name="difficulty"
              label="难度"
              rules={[{ required: true, message: "请选择难度" }]}
            >
              <Select options={difficultyOptions} style={{ width: 200 }} />
            </Form.Item>
            <Form.Item
              name="score"
              label="分值"
              rules={[{ required: true, message: "请输入分值" }]}
            >
              <Input type="number" min={1} style={{ width: 120 }} />
            </Form.Item>
          </Space>
          <Form.Item name="category" label="分类/知识点">
            <Input placeholder="例如：Java基础" />
          </Form.Item>
          <Form.Item name="options" label="选项（JSON格式）">
            <Input.TextArea rows={4} placeholder='{"A":"选项A","B":"选项B"}' />
          </Form.Item>
          <Form.Item
            name="answer"
            label="正确答案"
            rules={[{ required: true, message: "请输入答案" }]}
          >
            <Input placeholder="例如：A 或 A,B" />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}

