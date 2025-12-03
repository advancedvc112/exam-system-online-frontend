import { useEffect, useState } from "react";
import {
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  message
} from "antd";
import dayjs from "dayjs";
import {
  createExam,
  ExamDTO,
  ExamPageDTO,
  fetchExams,
  updateExamStatus
} from "../../api/exam";
import { fetchPapers, PaperDTO } from "../../api/paper";

const statusMap: Record<string, { text: string; color: string }> = {
  not_started: { text: "未开始", color: "blue" },
  in_progress: { text: "进行中", color: "green" },
  finished: { text: "已结束", color: "default" },
  cancelled: { text: "已取消", color: "red" }
};

export default function ExamSchedulePage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ExamPageDTO>();
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm<ExamDTO>();
  const [papers, setPapers] = useState<PaperDTO[]>([]);

  const loadData = async () => {
    setLoading(true);
    try {
      const page = await fetchExams({ pageNum: 1, pageSize: 20 });
      setData(page);
    } finally {
      setLoading(false);
    }
  };

  const loadPapers = async () => {
    const list = await fetchPapers(1, 100);
    setPapers(list);
  };

  useEffect(() => {
    loadData();
    loadPapers();
  }, []);

  const columns = [
    { title: "考试名称", dataIndex: "name" },
    {
      title: "状态",
      dataIndex: "status",
      render: (value: string) => (
        <Tag color={statusMap[value]?.color}>{statusMap[value]?.text}</Tag>
      )
    },
    { title: "试卷ID", dataIndex: "paperId" },
    { title: "考试时长", dataIndex: "duration" },
    {
      title: "考试时间",
      render: (record: ExamDTO) =>
        `${record.startTime} ~ ${record.endTime}`
    },
    {
      title: "操作",
      render: (record: ExamDTO) => (
        <Space>
          <Button size="small" onClick={() => updateExamStatus(record.id!)}>
            同步状态
          </Button>
        </Space>
      )
    }
  ];

  const handleSubmit = async () => {
    const values = await form.validateFields();
    await createExam({
      ...values,
      startTime: values.startTime?.toISOString(),
      endTime: values.endTime?.toISOString()
    });
    message.success("考试安排创建成功");
    setModalOpen(false);
    form.resetFields();
    loadData();
  };

  return (
    <Card
      title="考试安排"
      extra={
        <Button type="primary" onClick={() => setModalOpen(true)}>
          创建考试
        </Button>
      }
    >
      <Table
        rowKey="id"
        loading={loading}
        dataSource={data?.list}
        columns={columns}
        pagination={false}
      />

      <Modal
        title="创建考试"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSubmit}
      >
        <Form form={form} layout="vertical" initialValues={{ allowViewAnswer: 1 }}>
          <Form.Item
            name="name"
            label="考试名称"
            rules={[{ required: true, message: "请输入名称" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="paperId"
            label="关联试卷"
            rules={[{ required: true, message: "请选择试卷" }]}
          >
            <Select
              showSearch
              placeholder="请选择一份已存在的试卷"
              optionFilterProp="label"
              options={papers.map((paper) => ({
                value: paper.id!,
                label: `${paper.name}（ID: ${paper.id}）`
              }))}
            />
          </Form.Item>
          <Space>
            <Form.Item
              name="startTime"
              label="开始时间"
              rules={[{ required: true }]}
            >
              <DatePicker
                showTime
                style={{ width: 200 }}
                disabledDate={(current) => current && current < dayjs().startOf("day")}
              />
            </Form.Item>
            <Form.Item name="endTime" label="结束时间" rules={[{ required: true }]}>
              <DatePicker showTime style={{ width: 200 }} />
            </Form.Item>
          </Space>
          <Form.Item name="duration" label="考试时长（分钟）">
            <InputNumber min={30} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            name="allowViewAnswer"
            label="是否允许考试结束后查看答案"
          >
            <Select
              options={[
                { label: "允许", value: 1 },
                { label: "不允许", value: 0 }
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}

