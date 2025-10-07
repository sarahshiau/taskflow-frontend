// src/pages/Register.js
import React, { useReducer, useMemo, useRef, useCallback, useId } from "react";
import { Box, TextField, Button, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import api from "../api";

const initial = { username: "", email: "", password: "" };
function reducer(state, action) {
  switch (action.type) {
    case "change": return { ...state, [action.name]: action.value };
    case "reset":  return initial;
    default:       return state;
  }
}

export default function Register() {
  const [form, dispatch] = useReducer(reducer, initial);      // ✅ [hook] 可維護表單
  const firstRef = useRef(null);                               // ✅ [優化] 錯誤時聚焦
  const helpId = useId();                                      // ✅ [a11y]
  const navigate = useNavigate();

  // ✅ [優化] 衍生提交可用狀態（避免每次 render 重算）
  const canSubmit = useMemo(() => {
    return form.username.trim() && form.email.trim() && form.password.length >= 6;
  }, [form.username, form.email, form.password]);

  const onSubmit = useCallback(async () => {
    if (!canSubmit) {
      firstRef.current?.focus();
      return;
    }
    try {
      // ✅ 關鍵：鍵名必須就是 username / email / password
      const payload = {
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
      };
      const { data } = await api.post("/register", payload);
      alert("✅ 註冊成功，請用剛剛的 Email 登入");
      navigate("/login", { replace: true });
    } catch (err) {
      // 後端會回 message，包含：必填/密碼太短/重複帳號
      alert(`❌ 註冊失敗：${err.response?.data?.message || err.message}`);
      firstRef.current?.focus();
    }
  }, [canSubmit, form.username, form.email, form.password, navigate]);

  return (
    <Box sx={{ maxWidth: 420, mx: "auto", mt: 6 }}>
      <Typography variant="h5" mb={2}>建立新帳號</Typography>

      <TextField
        label="使用者名稱"
        value={form.username}
        inputRef={firstRef}
        onChange={(e) => dispatch({ type: "change", name: "username", value: e.target.value })}
        fullWidth sx={{ mb: 2 }}
        error={!form.username.trim()}
        helperText={!form.username.trim() ? "必填" : " "}
      />
      <TextField
        label="Email"
        type="email"
        value={form.email}
        onChange={(e) => dispatch({ type: "change", name: "email", value: e.target.value })}
        fullWidth sx={{ mb: 2 }}
        error={!form.email.trim()}
        helperText={!form.email.trim() ? "必填" : " "}
        aria-describedby={helpId}
      />
      <TextField
        label="密碼（至少 6 碼）"
        type="password"
        value={form.password}
        onChange={(e) => dispatch({ type: "change", name: "password", value: e.target.value })}
        fullWidth sx={{ mb: 2 }}
        error={form.password.length > 0 && form.password.length < 6}
        helperText={form.password.length > 0 && form.password.length < 6 ? "至少 6 碼" : " "}
      />

      <Typography id={helpId} variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
        註冊成功後，請用 Email / 密碼登入。
      </Typography>

      <Button variant="contained" disabled={!canSubmit} onClick={onSubmit}>
        建立帳號
      </Button>
    </Box>
  );
}
