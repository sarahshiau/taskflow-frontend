import React, {
  useReducer,      // ✅ [hook] 複合表單狀態集中管理（change/reset）
  useState,        // ✅ [hook] 提交中 / 是否顯示錯誤
  useRef,          // ✅ [hook] 驗證失敗時自動聚焦
  useCallback,     // ✅ [hook] 穩定提交處理器
  useId,           // ✅ [hook] a11y：欄位與說明綁定
  useEffect        // ✅ [hook] 掛載時自動聚焦
} from "react";
import { Box, TextField, Button, MenuItem, Typography } from "@mui/material";
import api from "../api";
import { useUI } from "../context/UIContext";   // ✅ [hook] useContext：全域 Toast

const STATUS_OPTIONS = [
  { value: "todo",        label: "待辦" },
  { value: "in_progress", label: "進行中" },
  { value: "done",        label: "已完成" },
];

// ✅ [優化] 表單 reducer：好維護、好測試、好重置
const initialForm = { title: "", description: "", status: "todo" };
function formReducer(state, action) {
  switch (action.type) {
    case "change": return { ...state, [action.name]: action.value };
    case "reset":  return initialForm;
    default:       return state;
  }
}

export default function TaskCreate() {
  const { showToast } = useUI(); // ✅ [hook] 實際使用 useContext
  const [form, dispatch] = useReducer(formReducer, initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const titleRef = useRef(null);
  const statusHelpId = useId();

  // ✅ [優化] 掛載時自動把游標放到「標題」
  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  const titleTrimmed = form.title.trim();
  const canSubmit = titleTrimmed.length > 0 && !isSubmitting;

  const handleSubmit = useCallback(async () => {
    setAttempted(true);
    if (!titleTrimmed) {
      titleRef.current?.focus();
      return;
    }
    try {
      setIsSubmitting(true);
      // ✅ [優化] 統一在提交時 trim，避免髒資料
      const payload = {
        title: titleTrimmed,
        description: form.description.trim(),
        status: form.status,
      };
      await api.post("/tasks", payload);
      dispatch({ type: "reset" });
      setAttempted(false);
      titleRef.current?.focus();
      showToast("✅ 任務已新增！", "success"); // ✅ [hook] 全域 Snackbar
      // 想建立後導回列表可加：navigate("/dashboard")
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      showToast(`❌ 新增失敗：${msg}`, "error");
    } finally {
      setIsSubmitting(false);
    }
  }, [form.description, form.status, showToast, titleTrimmed]);

  return (
    // ✅ [優化] 支援 Enter 送出
    <Box
      component="form"
      onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}
      sx={{ maxWidth: 520, mx: "auto", mt: 5 }}
    >
      <Typography variant="h5" mb={2}>新增任務</Typography>

      {/* 標題 */}
      <TextField
        label="標題"
        fullWidth
        inputRef={titleRef} // ✅ [hook] 錯誤時可自動 focus
        value={form.title}
        onChange={(e) => dispatch({ type: "change", name: "title", value: e.target.value })}
        sx={{ mb: 2 }}
        error={attempted && titleTrimmed.length === 0}
        helperText={attempted && titleTrimmed.length === 0 ? "標題不可為空" : " "}
      />

      {/* 描述 */}
      <TextField
        label="描述"
        fullWidth
        multiline
        rows={3}
        value={form.description}
        onChange={(e) => dispatch({ type: "change", name: "description", value: e.target.value })}
        sx={{ mb: 2 }}
      />

      {/* 狀態 */}
      <TextField
        label="狀態"
        select
        fullWidth
        value={form.status}
        onChange={(e) => dispatch({ type: "change", name: "status", value: e.target.value })}
        sx={{ mb: 2 }}
        aria-describedby={statusHelpId}
      >
        {STATUS_OPTIONS.map((opt) => (
          <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
        ))}
      </TextField>
      <Typography
        id={statusHelpId}
        variant="caption"
        color="text.secondary"
        sx={{ display: "block", mb: 2 }}
      >
        選擇任務目前狀態：待辦 / 進行中 / 已完成。
      </Typography>

      {/* 提交 */}
      <Button
        type="submit"
        variant="contained"
        disabled={!canSubmit} // ✅ [優化] 空標題或提交中禁用
      >
        {isSubmitting ? "新增中…" : "新增任務"}
      </Button>
    </Box>
  );
}


// import React, { useState } from "react";
// import { Box, TextField, Button, MenuItem, Typography } from "@mui/material";
// import api from "../api";   // ✅ 改名

// const STATUS_OPTIONS = [
//   { value: "todo",        label: "待辦" },
//   { value: "in_progress", label: "進行中" },
//   { value: "done",        label: "已完成" },
// ];

// const TaskCreate = () => {
//   const [title, setTitle] = useState("");
//   const [description, setDescription] = useState("");
//   const [status, setStatus] = useState("todo");

//   const handleSubmit = async () => {
//     try {
//       const res = await api.post("/tasks", { title, description, status }); // ✅ 使用 api

//       console.log("✅ 成功新增：", res.data);
//       alert("✅ 任務已新增！");
//       setTitle("");
//       setDescription("");
//       setStatus("todo");
//     } catch (err) {
//       const msg = err.response?.data?.message || err.message;
//       console.error("❌ 新增失敗 ▶", msg, err.response?.data);
//       alert(`❌ 新增失敗：${msg}`);
//     }
//   };

//   return (
//     <Box sx={{ maxWidth: 500, mx: "auto", mt: 5 }}>
//       <Typography variant="h5" mb={2}>新增任務</Typography>
//       <TextField label="標題" fullWidth value={title}
//                  onChange={(e) => setTitle(e.target.value)} sx={{ mb: 2 }} />
//       <TextField label="描述" fullWidth multiline rows={3}
//                  value={description} onChange={(e) => setDescription(e.target.value)} sx={{ mb: 2 }} />
//       <TextField label="狀態" select fullWidth value={status}
//                  onChange={(e) => setStatus(e.target.value)} sx={{ mb: 2 }}>
//         {STATUS_OPTIONS.map(opt => (
//           <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
//         ))}
//       </TextField>
//       <Button variant="contained" onClick={handleSubmit}>新增任務</Button>
//     </Box>
//   );
// };

// export default TaskCreate;
