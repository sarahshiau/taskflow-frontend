// src/App.js
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./components/AppLayout";
import PublicLayout from "./components/PublicLayout"; // ⬅️ 新增
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import TaskCreate from "./pages/TaskCreate";
import { UIProvider } from "./context/UIContext"; // ✅ [hook] useContext Provider（全域 Toast）

export default function App() {
  return (
    <UIProvider>
      <BrowserRouter>
        <Routes>
          {/* 公開頁：套 PublicLayout（有品牌 Navbar，但無私有選項） */}
          <Route element={<PublicLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* 需登入頁：先過 ProtectedRoute，再套 AppLayout（私有 Navbar） */}
          {/* ✅ [優化] 僅登入後才渲染 AppLayout，避免在公開頁看到私有導覽 */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/create-task" element={<TaskCreate />} />
            </Route>
          </Route>

          {/* 兜底 */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </UIProvider>
  );
}
