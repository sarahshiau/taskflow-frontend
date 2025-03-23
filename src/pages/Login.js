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

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    console.log('👉 handleSubmit 被執行了！', formData);
    if (!formData.email || !formData.password) {
      setError('請填寫所有欄位');
      return;
    }

    try {
      const res = await login(formData);
      console.log('✅ 登入成功', res);
      localStorage.setItem('token', res.data.token);
      navigate('/dashboard');
    } catch (err) {
      console.error('❌ 登入失敗', err);
      if (err.response) {
        console.error('👉 錯誤回應:', err.response);
        setError(`登入失敗: ${err.response.status} ${err.response.data.message || ''}`);
      } else {
        console.error('👉 錯誤訊息:', err.message);
        setError('登入失敗，請檢查網路或伺服器');
      }
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
