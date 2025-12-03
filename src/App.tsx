import { ConfigProvider, Layout } from "antd";
import zhCN from "antd/es/locale/zh_CN";
import { Navigate, Route, Routes } from "react-router-dom";
import ShellLayout from "./components/layout/ShellLayout";
import LoginPage from "./pages/auth/LoginPage";
import QuestionPage from "./pages/question/QuestionPage";
import PaperPage from "./pages/paper/PaperPage";
import ExamSchedulePage from "./pages/exam/ExamSchedulePage";
import ExecutionPage from "./pages/execution/ExecutionPage";
import HomePage from "./pages/home/HomePage";
import ProtectedRoute from "./components/auth/ProtectedRoute";

function App() {
  return (
    <ConfigProvider locale={zhCN} theme={{ token: { colorPrimary: "#1677ff" } }}>
      <Layout style={{ minHeight: "100vh" }}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <ShellLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<HomePage />} />
            <Route path="questions" element={<QuestionPage />} />
            <Route path="papers" element={<PaperPage />} />
            <Route path="exams" element={<ExamSchedulePage />} />
            <Route path="execution" element={<ExecutionPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </ConfigProvider>
  );
}

export default App;

