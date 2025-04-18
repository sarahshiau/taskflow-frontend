import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../api'; // ✅ 確認匯入的名字

import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
} from '@mui/material';

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    if (!formData.username || !formData.email || !formData.password) {
      setError('請填寫所有欄位');
      return;
    }

    try {
      // ✅ 呼叫正確的 register 函式（從 api.js 匯入）
      await register(formData.username, formData.email, formData.password);
      alert('註冊成功！請登入');
      navigate('/login');
    } catch (err) {
      setError('註冊失敗，請確認資料');
      console.error('註冊錯誤:', err);
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ padding: 4, mt: 10 }}>
        <Typography variant="h5" align="center" gutterBottom>
          註冊 TaskFlow
        </Typography>

        {error && <Alert severity="error">{error}</Alert>}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          <TextField
            label="使用者名稱"
            name="username"
            value={formData.username}
            onChange={handleChange}
            fullWidth
          />

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
            註冊
          </Button>

          <Button variant="text" onClick={() => navigate('/login')}>
            已有帳號？前往登入
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default Register;
