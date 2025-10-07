// src/components/ProtectedRoute.js
import React, { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

export default function ProtectedRoute() {
  const location = useLocation();

  // ✅ [hook] 初始從 localStorage 取得登入狀態（避免首次 render 閃一下）
  const [isAuthed, setIsAuthed] = useState(() => !!localStorage.getItem("token"));

  useEffect(() => {
    // ✅ [hook][優化] 跨分頁同步：別的分頁登入/登出時會觸發 'storage'
    const onStorage = (e) => {
      if (e.key === "token") setIsAuthed(!!e.newValue);
    };
    window.addEventListener("storage", onStorage);

    // ✅ [hook][優化] 回到本分頁時（或切換分頁可見）再讀一次，處理「同分頁修改不觸發 storage」的情況
    const onVisibility = () => setIsAuthed(!!localStorage.getItem("token"));
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.removeEventListener("storage", onStorage);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  // ✅ [說明] 直接使用狀態，不需要 useMemo；ESLint 警告自然消失
  if (!isAuthed) {
    // ✅ [優化] 保留來源路徑，登入成功後可導回
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <Outlet />;
}

// // src/components/ProtectedRoute.js
// import React from "react";
// import { Navigate, Outlet } from "react-router-dom";

// export default function ProtectedRoute() {
//   const token = localStorage.getItem("token");

//   // 有 token → 繼續往下渲染子路由
//   // 沒 token → 導回登入頁
//   return token ? <Outlet /> : <Navigate to="/login" replace />;
// }
