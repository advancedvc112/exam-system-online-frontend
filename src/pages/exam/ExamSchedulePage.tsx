import { useEffect, useMemo, useState } from "react";
import {
  App,
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
  Tag
} from "antd";
import dayjs from "dayjs";
import {
  createExam,
  ExamDTO,
  ExamPageDTO,
  fetchExams,
  updateExamStatus,
  deleteExam
} from "../../api/exam";
import { fetchPapers, PaperDTO } from "../../api/paper";
import { startExam } from "../../api/execution";
import { useAuth } from "../../state/AuthContext";

const statusMap: Record<string, { text: string; color: string }> = {
  not_started: { text: "未开始", color: "blue" },
  in_progress: { text: "进行中", color: "green" },
  finished: { text: "已结束", color: "default" },
  cancelled: { text: "已取消", color: "red" }
};

export default function ExamSchedulePage() {
  const { message } = App.useApp();
  const { role } = useAuth();
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

  const handleSyncStatus = async (record: ExamDTO) => {
    if (!record.id) return;
    await updateExamStatus(record.id);
    message.success("考试状态已同步（开启/结束考试）");
    loadData();
  };

  const handleDelete = async (record: ExamDTO) => {
    if (!record.id) return;
    await deleteExam(record.id);
    message.success("考试已取消");
    loadData();
  };

  const handleEnterExam = async (record: ExamDTO) => {
    if (!record.id) return;
    try {
      const res = await startExam(record.id);
      // 后端有可能返回裸的数字，也有可能包了一层对象，这里统一做兼容处理
      const examRecordId =
        typeof res === "number"
          ? res
          : (res as any).examRecordId ?? (res as any).id ?? (res as any).data;
      message.success("进入考试成功");
      // 跳转到考试执行页面，携带考试记录ID
      if (examRecordId == null || Number.isNaN(Number(examRecordId))) {
        message.error("进入考试失败：考试记录ID异常");
        return;
      }
      window.location.href = `/execution?examRecordId=${Number(examRecordId)}`;
    } catch (e: any) {
      const raw = e?.response?.data?.message ?? e?.message;
      message.error(
        typeof raw === "string" ? raw : "进入考试失败"
      );
    }
  };

  const columns = useMemo(
    () => {
      const base = [
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
        }
      ];

      if (role === "student") {
        return [
          ...base,
          {
            title: "操作",
            render: (record: ExamDTO) => (
              <Space>
                <Button
                  type="primary"
                  size="small"
                  disabled={record.status !== "in_progress"}
                  onClick={() => handleEnterExam(record)}
                >
                  进入考试
                </Button>
              </Space>
            )
          }
        ];
      }

      // 管理员/教师视图：原来的“开启/结束/取消”操作
      return [
        ...base,
        {
          title: "操作",
          render: (record: ExamDTO) => (
            <Space>
              <Button size="small" onClick={() => handleSyncStatus(record)}>
                {record.status === "not_started"
                  ? "开启考试"
                  : record.status === "in_progress"
                  ? "结束考试"
                  : "同步状态"}
              </Button>
              {record.status === "not_started" && (
                <Button danger size="small" onClick={() => handleDelete(record)}>
                  取消考试
                </Button>
              )}
            </Space>
          )
        }
      ];
    },
    [role]
  );

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
        role !== "student" && (
          <Button type="primary" onClick={() => setModalOpen(true)}>
            创建考试
          </Button>
        )
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

