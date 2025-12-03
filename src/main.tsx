import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App as AntdApp } from "antd";
import App from "./App";
import { AuthProvider } from "./state/AuthContext";
import "./styles/global.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AntdApp>
          <App />
        </AntdApp>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);

