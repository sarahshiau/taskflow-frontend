// src/pages/Login.js
import React, { useReducer, useRef, useEffect, useCallback, useId, useMemo } from "react";
import { Box, TextField, Button, Typography } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../api";

const initial = { email: "", password: "" };
function reducer(state, action) {
  switch (action.type) {
    case "change": return { ...state, [action.name]: action.value };
    case "reset":  return initial;
    default:       return state;
  }
}

export default function Login() {
  const [form, dispatch] = useReducer(reducer, initial); // ✅ [hook]
  const emailRef = useRef(null);                         // ✅ [hook] 聚焦/錯誤時 focus
  const navigate = useNavigate();
  const location = useLocation();
  const helpId = useId();                                // ✅ [hook] a11y 說明 id

  // ✅ [hook][優化] 已登入就直接去 Dashboard
  useEffect(() => {
    if (localStorage.getItem("token")) navigate("/dashboard", { replace: true });
  }, [navigate]);

  // ✅ [hook] 衍生提交可用狀態（避免每次 render 重算）
  const canSubmit = useMemo(
    () => form.email.trim() && form.password.length >= 6,
    [form.email, form.password]
  );

  const handleSubmit = useCallback(async () => {
    if (!canSubmit) {
      emailRef.current?.focus();
      return;
    }
    try {
      const payload = {
        email: form.email.trim(),
        password: form.password,
      };
      const { data } = await api.post("/login", payload); // ⚠️ 路由請對齊你的後端
      localStorage.setItem("token", data.token);
      // ✅ [優化] 從 ProtectedRoute 來的，導回原頁；否則去 dashboard
      const to = location.state?.from?.pathname || "/dashboard";
      navigate(to, { replace: true });
    } catch (err) {
      alert(`❌ 登入失敗：${err.response?.data?.message || err.message}`);
      emailRef.current?.focus();
    }
  }, [canSubmit, form.email, form.password, location.state, navigate]);

  return (
    <Box sx={{ maxWidth: 420, mx: "auto", mt: 6 }}>
      <Typography variant="h5" mb={2}>登入</Typography>

      <TextField
        label="Email"
        type="email"
        inputRef={emailRef}
        value={form.email}
        onChange={(e) => dispatch({ type: "change", name: "email", value: e.target.value })}
        fullWidth sx={{ mb: 2 }}
        aria-describedby={helpId}
      />
      <TextField
        label="密碼（至少 6 碼）"
        type="password"
        value={form.password}
        onChange={(e) => dispatch({ type: "change", name: "password", value: e.target.value })}
        fullWidth sx={{ mb: 2 }}
      />
      <Typography id={helpId} variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
        登入後將導回上次嘗試進入的頁面。
      </Typography>

      <Button variant="contained" disabled={!canSubmit} onClick={handleSubmit}>
        登入
      </Button>
      <Typography variant="body2" sx={{ mt: 2 }}>
        沒有帳號？<a href="/register">建立一個</a>
      </Typography>

    </Box>
  );
}

// // src/pages/Login.jsx
// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { login } from "../api";
// import {
//   Container, Box, TextField, Button, Typography, Paper, Alert,
// } from "@mui/material";

// export default function Login({ onLogin }) {
//   const navigate = useNavigate();
//   const [formData, setFormData] = useState({ email: "", password: "" });
//   const [error, setError] = useState("");

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!formData.email || !formData.password) {
//       setError("請填寫所有欄位");
//       return;
//     }
//     try {
//       const res = await login(formData); // 走 api instance
//       const token = res.data?.token;
//       if (!token) throw new Error("後端未回傳 token");
//       localStorage.setItem("token", token);
//       onLogin?.();
//       navigate("/dashboard");
//     } catch (err) {
//       setError(err.response?.data?.message || "登入失敗，請確認帳密");
//       console.error("登入失敗 ▶", err.response?.data || err.message);
//     }
//   };

//   return (
//     <Container maxWidth="sm">
//       <Paper elevation={3} sx={{ p: 4, mt: 10 }}>
//         <Typography variant="h5" align="center" gutterBottom>
//           登入 TaskFlow
//         </Typography>
//         {error && <Alert severity="error">{error}</Alert>}
//         <Box component="form" onSubmit={handleSubmit}
//              sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
//           <TextField label="Email" name="email" value={formData.email}
//                      onChange={handleChange} fullWidth required />
//           <TextField label="密碼" name="password" type="password"
//                      value={formData.password} onChange={handleChange}
//                      fullWidth required />
//           <Button type="submit" variant="contained">登入</Button>
//           <Button variant="text" onClick={() => navigate("/register")}>
//             沒有帳號？前往註冊
//           </Button>
//         </Box>
//       </Paper>
//     </Container>
//   );
// }


// // import React, { useState } from 'react';
// // import { useNavigate } from 'react-router-dom';
// // import { login } from '../api';

// // // ✅ MUI 元件
// // import {
// //   Container,
// //   Box,
// //   TextField,
// //   Button,
// //   Typography,
// //   Paper,
// //   Alert,
// // } from '@mui/material';

// // function Login({ onLogin }) {
// //   const navigate = useNavigate();
// //   const [formData, setFormData] = useState({ email: '', password: '' });
// //   const [error, setError] = useState('');


// //   const handleChange = (e) => {
// //     const { name, value } = e.target;
// //     setFormData((prevData) => ({
// //       ...prevData,
// //       [name]: value,
// //     }));
// //   };

// //   const handleSubmit = async () => {
// //     if (!formData.email || !formData.password) {
// //       setError('請填寫所有欄位');
// //       return;
// //     }

// //     try {
// //       const res = await login(formData);
// //       localStorage.setItem('token', res.data.token);

// //       if (onLogin) onLogin();   // 觸發 App.js 的登入狀態變化
// //       navigate('/dashboard');
// //     } catch (err) {
// //       setError('登入失敗，請確認帳號密碼');
// //     }
// //   };

// //   return (
// //     <Container maxWidth="sm">
// //       <Paper elevation={3} sx={{ padding: 4, mt: 10 }}>
// //         <Typography variant="h5" align="center" gutterBottom>
// //           登入 TaskFlow
// //         </Typography>

// //         {error && <Alert severity="error">{error}</Alert>}

// //         <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
// //           <TextField
// //             label="Email"
// //             name="email"
// //             value={formData.email}
// //             onChange={handleChange}
// //             fullWidth
// //           />

// //           <TextField
// //             label="密碼"
// //             name="password"
// //             type="password"
// //             value={formData.password}
// //             onChange={handleChange}
// //             fullWidth
// //           />

// //           <Button variant="contained" onClick={handleSubmit}>
// //             登入
// //           </Button>

// //           <Button variant="text" onClick={() => navigate('/register')}>
// //             沒有帳號？前往註冊
// //           </Button>
// //         </Box>
// //       </Paper>
// //     </Container>
// //   );
// // }

// // export default Login;
