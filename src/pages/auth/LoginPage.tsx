import { Button, Card, Form, Input, Select, Typography } from "antd";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../state/AuthContext";
import { LoginPayload, UserRole } from "../../api/auth";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: Location })?.from?.pathname ?? "/";

  const handleSubmit = async (values: LoginPayload) => {
    setLoading(true);
    try {
      if (isRegister) {
        await register(values);
      } else {
        await login(values);
      }
      navigate(from, { replace: true });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f5f7fb"
      }}
    >
      <Card style={{ width: 380 }}>
        <Typography.Title level={4} style={{ textAlign: "center" }}>
          在线考试系统{isRegister ? "注册" : "登录"}
        </Typography.Title>
        <Form<LoginPayload>
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ role: "student" as UserRole }}
        >
          <Form.Item
            label="用户名"
            name="username"
            rules={[{ required: true, message: "请输入用户名" }]}
          >
            <Input size="large" placeholder="用户名" />
          </Form.Item>
          <Form.Item
            label="密码"
            name="password"
            rules={[{ required: true, message: "请输入密码" }]}
          >
            <Input.Password size="large" placeholder="密码" />
          </Form.Item>
          <Form.Item
            label="身份"
            name="role"
            rules={[{ required: true, message: "请选择身份" }]}
          >
            <Select<UserRole>
              size="large"
              options={[
                { label: "管理员", value: "admin" },
                { label: "教师", value: "teacher" },
                { label: "学生", value: "student" }
              ]}
            />
          </Form.Item>
          <Button
            type="primary"
            block
            size="large"
            htmlType="submit"
            loading={loading}
          >
            {isRegister ? "注册并登录" : "登录"}
          </Button>
          <div style={{ marginTop: 16, textAlign: "center" }}>
            <Button
              type="link"
              onClick={() => setIsRegister(!isRegister)}
            >
              {isRegister ? "已有账号？去登录" : "没有账号？去注册"}
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}

