import { Button, Card, Form, Input, Typography } from "antd";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../state/AuthContext";
import { LoginPayload } from "../../api/auth";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: Location })?.from?.pathname ?? "/";

  const handleSubmit = async (values: LoginPayload) => {
    setLoading(true);
    try {
      await login(values);
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
          在线考试系统登录
        </Typography.Title>
        <Form layout="vertical" onFinish={handleSubmit}>
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
          <Button
            type="primary"
            block
            size="large"
            htmlType="submit"
            loading={loading}
          >
            登录
          </Button>
        </Form>
      </Card>
    </div>
  );
}

