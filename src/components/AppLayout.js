// src/components/AppLayout.js
import React, { useEffect, useRef, useCallback, useMemo } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { AppBar, Toolbar, Button, Box, Typography } from "@mui/material";

export default function AppLayout() {
  const location = useLocation();               // ✅ [hook] 監聽路由變化
  const mainRef = useRef(null);                 // ✅ [hook] 聚焦主內容（a11y）
  const navigate = useNavigate();

  // ✅ [hook][優化] 換頁後把焦點移到主內容 & 回到頁頂（鍵盤/讀屏友善）
  useEffect(() => {
    mainRef.current?.focus();
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // ✅ [hook][優化] 動態文件標題（面試好講）
  useEffect(() => {
    const map = { "/login": "登入", "/dashboard": "總覽", "/create-task": "新增任務" };
    const title = map[location.pathname] || "TaskFlow";
    document.title = `TaskFlow — ${title}`;
  }, [location.pathname]);

  // ✅ [hook][優化] 穩定的登出 handler
  const onLogout = useCallback(() => {
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  }, [navigate]);

  // ✅ [hook][優化] 計算導覽列（避免每次 render 重建陣列）
  const navItems = useMemo(
    () => [
      { to: "/dashboard", label: "Dashboard" },
      { to: "/create-task", label: "新增任務" },
    ],
    []
  );

  return (
    <Box>
      <AppBar position="static">
        <Toolbar sx={{ gap: 1 }}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>TaskFlow</Typography>
          {navItems.map((n) => (
            <Button key={n.to} color="inherit" component={Link} to={n.to}>
              {n.label}
            </Button>
          ))}
          {localStorage.getItem("token") ? (
            <Button color="inherit" onClick={onLogout}>登出</Button>
          ) : (
            <Button color="inherit" component={Link} to="/login">登入</Button>
          )}
        </Toolbar>
      </AppBar>

      {/* ✅ tabIndex 讓主內容可聚焦；ref 供換頁自動 focus */}
      <Box component="main" ref={mainRef} tabIndex={-1} sx={{ p: 3, outline: "none" }}>
        <Outlet />
      </Box>
    </Box>
  );
}

// import React from "react";
// import { useNavigate, Outlet } from "react-router-dom";
// import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";

// export default function AppLayout() {
//   const navigate = useNavigate();
//   const token = localStorage.getItem("token");
//   const isAuthed = !!token;

//   const handleLogout = () => {
//     localStorage.removeItem("token");
//     navigate("/login", { replace: true });
//   };

//   return (
//     <>
//       <AppBar position="static" elevation={1} color="inherit">
//         <Toolbar>
//           <Typography variant="h6" sx={{ mr: 2, cursor: "pointer" }} onClick={() => navigate("/dashboard")}>
//             TaskFlow
//           </Typography>

//           {/* 左側快捷 */}
//           {isAuthed && (
//             <>
//               <Button onClick={() => navigate("/dashboard")}>Dashboard</Button>
//               <Button onClick={() => navigate("/create-task")}>新增任務</Button>
//             </>
//           )}

//           <Box sx={{ flexGrow: 1 }} />

//           {/* 右側登入 / 登出 */}
//           {!isAuthed ? (
//             <Button variant="contained" onClick={() => navigate("/login")}>
//               登入
//             </Button>
//           ) : (
//             <Button variant="outlined" onClick={handleLogout}>
//               登出
//             </Button>
//           )}
//         </Toolbar>
//       </AppBar>

//       {/* 這裡渲染子頁面 */}
//       <Outlet />
//     </>
//   );
// }
