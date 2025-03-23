import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Login from "./pages/Login";           // ✅ 這個是你的 Login.js
import Register from "./pages/Register";     // ✅ 這個是你的 Register.js
import Dashboard from "./pages/Dashboard";

import { createTheme, ThemeProvider } from '@mui/material/styles';
import { AppBar, Toolbar, Typography, Button, Box, Container } from '@mui/material';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#f50057',
    },
  },
  shape: {
    borderRadius: 12,
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
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

        <Container sx={{ marginTop: 4 }}>
          <Routes>
            <Route path="/login" element={<Login />} />         {/* ✅ 指向 Login.js */}
            <Route path="/register" element={<Register />} />   {/* ✅ 指向 Register.js */}
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </Container>
      </Router>
    </ThemeProvider>
  );
}

export default App;
