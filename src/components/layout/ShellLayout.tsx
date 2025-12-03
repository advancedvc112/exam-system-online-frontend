import { Layout, Menu, Typography } from "antd";
import {
  FileTextOutlined,
  HomeOutlined,
  ReadOutlined,
  ScheduleOutlined,
  ThunderboltOutlined
} from "@ant-design/icons";
import { useMemo } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../state/AuthContext";

const { Header, Sider, Content } = Layout;

const menuItems = [
  { key: "/", label: "概览", icon: <HomeOutlined /> },
  { key: "/questions", label: "题库管理", icon: <ReadOutlined /> },
  { key: "/papers", label: "试卷管理", icon: <FileTextOutlined /> },
  { key: "/exams", label: "考试安排", icon: <ScheduleOutlined /> },
  { key: "/execution", label: "考试执行", icon: <ThunderboltOutlined /> }
];

export default function ShellLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { username, role, logout } = useAuth();

  const selectedKeys = useMemo(() => {
    const match = menuItems.find((item) => location.pathname.startsWith(item.key));
    return match ? [match.key] : ["/"];
  }, [location.pathname]);

  return (
    <Layout>
      <Sider breakpoint="lg" collapsedWidth="0">
        <div className="logo" style={{ textAlign: "center", padding: "16px" }}>
          <Typography.Title level={4} style={{ color: "#fff", margin: 0 }}>
            在线考试
          </Typography.Title>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={selectedKeys}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            background: "#fff",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingInline: 24
          }}
        >
          <Typography.Title level={5} style={{ margin: 0 }}>
            高并发在线考试系统
          </Typography.Title>
          <div>
            <Typography.Text style={{ marginRight: 16 }}>
              {username}（{role}）
            </Typography.Text>
            <Typography.Link onClick={logout}>退出登录</Typography.Link>
          </div>
        </Header>
        <Content style={{ margin: 24, background: "#fff", padding: 24 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}

