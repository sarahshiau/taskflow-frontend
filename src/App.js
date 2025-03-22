import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { AppBar, Toolbar, Typography, Button, Box, Container } from '@mui/material';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // 主要色
    },
    secondary: {
      main: '#f50057', // 次要色
    },
  },
  shape: {
    borderRadius: 12, // 元件圓角
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        {/* AppBar 導航 */}
        <AppBar position="static" color="primary">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              TaskFlow 系統
            </Typography>
            <Box>
              <Button color="inherit" component={Link} to="/login">
                登入
              </Button>
              <Button color="inherit" component={Link} to="/register">
                註冊
              </Button>
              <Button color="inherit" component={Link} to="/dashboard">
                Dashboard
              </Button>
            </Box>
          </Toolbar>
        </AppBar>

        {/* 主內容區塊 */}
        <Container sx={{ marginTop: 4 }}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </Container>
      </Router>
    </ThemeProvider>
  );
}

export default App;
