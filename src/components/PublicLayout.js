// src/components/PublicLayout.js
import React, { useEffect, useRef } from "react";
import { Outlet, Link as RouterLink, useLocation } from "react-router-dom";
import { AppBar, Toolbar, Typography, Button, Box, Container } from "@mui/material";

export default function PublicLayout() {
  const location = useLocation();
  const mainRef = useRef(null);

  // ✅ [hook] useEffect：換頁後主內容自動聚焦 & 回到頂端；可避免螢幕閱讀器迷路
  useEffect(() => {
    mainRef.current?.focus();
    window.scrollTo({ top: 0, behavior: "instant" });
    // 也可動態設定標題
    document.title = "TaskFlow";
  }, [location.pathname]);

  // ✅ [優化] 簡化：公開區只顯示品牌 + Login/Register，保持與私有區外觀一致
  return (
    <>
      <AppBar position="static" color="primary" elevation={1}>
        <Toolbar sx={{ gap: 2 }}>
          <Typography
            variant="h6"
            component={RouterLink}
            to="/login"
            style={{ color: "inherit", textDecoration: "none" }}
          >
            TaskFlow
          </Typography>

          <Box sx={{ ml: "auto", display: "flex", gap: 1 }}>
            <Button
              color="inherit"
              component={RouterLink}
              to="/login"
              disabled={location.pathname === "/login"}
            >
              登入
            </Button>
            <Button
              color="inherit"
              component={RouterLink}
              to="/register"
              disabled={location.pathname === "/register"}
            >
              註冊
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Container
        component="main"
        tabIndex={-1}
        ref={mainRef}
        sx={{ py: 6, outline: "none" }}
      >
        <Outlet />
      </Container>
    </>
  );
}
