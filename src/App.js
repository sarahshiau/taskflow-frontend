import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";
import React, { useState, useEffect } from 'react';

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";

import { createTheme, ThemeProvider } from '@mui/material/styles';
import { AppBar, Toolbar, Typography, Button, Box, Container } from '@mui/material';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',  // 主要顏色
    },
    secondary: {
      main: '#f50057',  // 次要顏色
    },
  },
  shape: {
    borderRadius: 12, // 圓角
  },
});

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 監聽 token，判斷是否登入
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    window.location.href = "/login";  // 重整跳回登入
  };

  return (
    <ThemeProvider theme={theme}>
      <Router>
        {/* 導覽列 */}
        <AppBar position="static" color="primary">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              TaskFlow 系統
            </Typography>

            <Box>
              {!isLoggedIn ? (
                <>
                  <Button color="inherit" component={Link} to="/login">
                    登入
                  </Button>
                  <Button color="inherit" component={Link} to="/register">
                    註冊
                  </Button>
                </>
              ) : (
                <>
                  <Button color="inherit" component={Link} to="/dashboard">
                    Dashboard
                  </Button>
                  <Button color="inherit" onClick={handleLogout}>
                    登出
                  </Button>
                </>
              )}
            </Box>
          </Toolbar>
        </AppBar>

        {/* 主內容 */}
        <Container sx={{ marginTop: 4 }}>
          <Routes>
            <Route path="/login" element={<Login onLogin={() => setIsLoggedIn(true)} />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </Container>
      </Router>
    </ThemeProvider>
  );
}

export default App;
