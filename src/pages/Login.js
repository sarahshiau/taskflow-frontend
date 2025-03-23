import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api';

// ✅ MUI 元件
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
} from '@mui/material';

function Login({ onLogin }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

 
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.email || !formData.password) {
      setError('請填寫所有欄位');
      return;
    }

    try {
      const res = await login(formData);
      localStorage.setItem('token', res.data.token);

      if (onLogin) onLogin();   // 觸發 App.js 的登入狀態變化
      navigate('/dashboard');
    } catch (err) {
      setError('登入失敗，請確認帳號密碼');
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ padding: 4, mt: 10 }}>
        <Typography variant="h5" align="center" gutterBottom>
          登入 TaskFlow
        </Typography>

        {error && <Alert severity="error">{error}</Alert>}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          <TextField
            label="Email"
            name="email"
            value={formData.email}
            onChange={handleChange} 
            fullWidth
          />

          <TextField
            label="密碼"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange} 
            fullWidth
          />

          <Button variant="contained" onClick={handleSubmit}>
            登入
          </Button>

          <Button variant="text" onClick={() => navigate('/register')}>
            沒有帳號？前往註冊
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default Login;
