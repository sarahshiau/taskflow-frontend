//Dashboard.js
import React, {
  useEffect,          // ✅ [hook] 初次載入 fetch、導向
  useMemo,            // ✅ [hook] 資料衍生（過濾/圖表）
  useState,           // ✅ [hook] UI 狀態
  useDeferredValue,   // ✅ [hook] 搜尋不卡頓
  useCallback,        // ✅ [hook] 穩定事件處理器（配合 React.memo）
  useTransition       // ✅ [hook] 將搜尋/篩選更新設為低優先度
} from "react";
import {
  Box, Typography, Grid, Card, CardContent, Button, Alert,
  CircularProgress, Select, MenuItem, FormControl, InputLabel,
  LinearProgress, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField
} from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom"; // ✅ [hook] URL 同步
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid
} from "recharts";
import api from "../api";
import { useUI } from "../context/UIContext"; // ✅ [hook] useContext：全域 Toast

/** 後端 ↔ 前端 顯示映射（後端用英文、畫面顯示中文） */
const STATUS_LABEL = { todo: "待辦", in_progress: "進行中", done: "已完成" };
const LABEL_STATUS = { "待辦": "todo", "進行中": "in_progress", "已完成": "done" };
const COLORS = ["#8884d8", "#82ca9d", "#ffc658"];

export default function Dashboard() {
  const navigate = useNavigate();
  const { showToast } = useUI();                // ✅ [hook] useContext
  const [searchParams, setSearchParams] = useSearchParams(); // ✅ [hook] URL 同步
  const [isPending, startTransition] = useTransition();      // ✅ [hook] 低優先度 UI 更新

  /** 狀態 */
  const [tasks, setTasks] = useState([]);                 // 原始任務（後端回傳）
  const [error, setError] = useState("");                 // 錯誤訊息顯示
  const [loading, setLoading] = useState(true);           // 初次載入用
  const [statusFilter, setStatusFilter] = useState(
    searchParams.get("status") || "全部"                  // ✅ [優化] 初值從 URL 帶入
  );
  const [query, setQuery] = useState(searchParams.get("q") || ""); // 同上
  const deferredQuery = useDeferredValue(query);           // ✅ [hook] 輸入不卡

  /** 編輯用的 Dialog 狀態 */
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    id: null, title: "", description: "", status: "todo",
  });

  /** 首次進入頁面：檢查 token、讀取任務 */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("未授權，請先登入");
      navigate("/login");
      return;
    }
    fetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** 同步篩選/搜尋到 URL（可分享、可重整保留） */
  useEffect(() => {
    const next = new URLSearchParams();
    if (statusFilter !== "全部") next.set("status", statusFilter);
    if (query.trim()) next.set("q", query.trim());
    setSearchParams(next, { replace: true });
  }, [statusFilter, query, setSearchParams]);

  /** 從後端讀取任務（Read） */
  const fetchTasks = async () => {
    try {
      const res = await api.get("/tasks");
      setTasks(res.data || []);
    } catch (err) {
      console.error("❌ 讀取任務失敗：", err.response?.data || err.message);
      setError("無法載入任務");
    } finally {
      setLoading(false);
    }
  };

  /** 依目前篩選（中文）+ 搜尋字串 回傳畫面要顯示的任務（英文比對、中文顯示） */
  const viewTasks = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    const statusKey = LABEL_STATUS[statusFilter];

    const filtered = tasks.filter((t) => {
      const statusOk = statusFilter === "全部" ? true : t.status === statusKey;
      if (!statusOk) return false;

      if (!q) return true; // 無搜尋字串時不做字串比對
      const title = (t.title || "").toLowerCase();
      const desc  = (t.description || "").toLowerCase();
      return title.includes(q) || desc.includes(q);
    });

    return filtered.map((t) => ({
      ...t,
      statusLabel: STATUS_LABEL[t.status] ?? t.status, // 顯示中文
    }));
  }, [tasks, statusFilter, deferredQuery]);

  /** 圓環圖資料（以英文 status 統計） */
  const statusData = useMemo(() => {
    const counts = { todo: 0, in_progress: 0, done: 0 };
    for (const t of viewTasks) {
      if (t.status in counts) counts[t.status] += 1;
    }
    return [
      { name: "待辦", value: counts.todo },
      { name: "進行中", value: counts.in_progress },
      { name: "已完成", value: counts.done },
    ];
  }, [viewTasks]);

  /** 折線圖：依建立日期聚合（created_at / createdAt 都容錯，並排序避免閃爍） */
  const trendData = useMemo(() => {
    const acc = {};
    for (const t of tasks) {
      const raw = t.created_at || t.createdAt;
      if (!raw) continue;
      const date = new Date(raw).toISOString().split("T")[0];
      acc[date] = (acc[date] || 0) + 1;
    }
    return Object.entries(acc)
      .sort((a, b) => (a[0] < b[0] ? -1 : 1))
      .map(([date, count]) => ({ date, count }));
  }, [tasks]);

  /** 完成率（用 viewTasks，與目前畫面一致） */
  const total = viewTasks.length;
  const completed = viewTasks.filter((t) => t.status === "done").length;
  const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

  /** --- Update / Delete 相關方法 --- */

  /** 開啟編輯框（把該卡片的資料帶入對話框） */
  const openEdit = useCallback((task) => {
    setEditForm({
      id: task.id,
      title: task.title,
      description: task.description || "",
      status: task.status, // 後端認得英文：todo | in_progress | done
    });
    setEditOpen(true);
  }, []);

  /** 編輯框輸入綁定 */
  const handleEditChange = (field, value) => {
    setEditForm((f) => ({ ...f, [field]: value }));
  };

  /** 儲存（Update：PUT /tasks/:id） */
  const saveEdit = useCallback(async () => {
    try {
      const body = {
        title: editForm.title.trim(),
        description: editForm.description.trim(),
        status: editForm.status,
      };
      if (!body.title) {
        setError("標題不可為空");
        return;
      }
      const { data } = await api.put(`/tasks/${editForm.id}`, body);
      setTasks((prev) => prev.map((t) => (t.id === editForm.id ? { ...t, ...data } : t)));
      setEditOpen(false);
      showToast("✅ 已更新任務", "success"); // ✅ [hook] useContext
    } catch (err) {
      console.error("更新失敗：", err.response?.data || err.message);
      setError(err.response?.data?.message || "更新失敗");
      showToast("❌ 更新失敗", "error");
    }
  }, [editForm, showToast]);

  /** 刪除（Delete：DELETE /tasks/:id） */
  const deleteTask = useCallback(async (id) => {
    const ok = window.confirm("確定要刪除這個任務嗎？此動作無法復原。");
    if (!ok) return;
    try {
      await api.delete(`/tasks/${id}`);
      setTasks((prev) => prev.filter((t) => t.id !== id));
      showToast("🗑️ 已刪除任務", "success");
    } catch (err) {
      console.error("刪除失敗：", err.response?.data || err.message);
      setError(err.response?.data?.message || "刪除失敗");
      showToast("❌ 刪除失敗", "error");
    }
  }, [showToast]);

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>🎉 歡迎來到 Dashboard</Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
        這裡是你的任務總覽
      </Typography>

      {error && <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>}
      {isPending && <LinearProgress sx={{ mb: 2 }} />} {/* ✅ [hook] useTransition 視覺提示 */}

      {loading ? (
        <Box textAlign="center" mt={4}><CircularProgress /></Box>
      ) : (
        <>
          {/* 篩選 + 搜尋 + 新增 */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", mb: 4 }}>
            {/* 左側：狀態篩選 + 搜尋框 */}
            <Box sx={{ display: "flex", gap: 2, alignItems: "flex-end" }}>
              <FormControl sx={{ minWidth: 150 }}>
                <InputLabel>狀態篩選</InputLabel>
                <Select
                  value={statusFilter}
                  label="狀態篩選"
                  onChange={(e) =>
                    startTransition(() => setStatusFilter(e.target.value)) // ✅ [hook] 低優先度更新
                  }
                >
                  <MenuItem value="全部">全部</MenuItem>
                  <MenuItem value="待辦">待辦</MenuItem>
                  <MenuItem value="進行中">進行中</MenuItem>
                  <MenuItem value="已完成">已完成</MenuItem>
                </Select>
              </FormControl>

              {/* ✅ [優化] 加入搜尋框；鍵入即時、昂貴過濾延後（deferredQuery） */}
              <TextField
                sx={{ minWidth: 280 }}
                label="搜尋標題/描述"
                value={query}
                onChange={(e) =>
                  startTransition(() => setQuery(e.target.value)) // ✅ [hook] 低優先度更新
                }
              />
            </Box>

            <Button variant="contained" onClick={() => navigate("/create-task")}>
              ➕ 新增任務
            </Button>
          </Box>

          {/* 圖表 */}
          <Grid container spacing={4} mb={4}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>任務狀態圓環圖</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%" cy="50%"
                    innerRadius={60} outerRadius={80}
                    label
                  >
                    {statusData.map((entry, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>任務建立趨勢</Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" />
                </LineChart>
              </ResponsiveContainer>
            </Grid>

            {/* 完成率 */}
            <Grid item xs={12}>
              <Card sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>✅ 完成率</Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Box sx={{ flexGrow: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={rate}
                      sx={{ height: 10, borderRadius: 5 }}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {`${completed} / ${total} (${rate}%)`}
                  </Typography>
                </Box>
              </Card>
            </Grid>
          </Grid>

          {/* 任務列表 */}
          <Grid container spacing={3}>
            {viewTasks.map((task) => (
              <Grid item xs={12} sm={6} md={4} key={task.id}>
                {/* ✅ [優化] 抽出 TaskCard 並以 React.memo 包裝（見檔案底部） */}
                <TaskCard task={task} onEdit={openEdit} onDelete={deleteTask} />
              </Grid>
            ))}
          </Grid>

          {/* 編輯對話框（Update） */}
          <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="sm">
            <DialogTitle>編輯任務</DialogTitle>
            <DialogContent sx={{ pt: 2, display: "grid", gap: 2 }}>
              <TextField
                label="標題"
                value={editForm.title}
                onChange={(e) => handleEditChange("title", e.target.value)}
                required
              />
              <TextField
                label="描述"
                value={editForm.description}
                onChange={(e) => handleEditChange("description", e.target.value)}
                multiline
                minRows={3}
              />
              <FormControl>
                <InputLabel>狀態</InputLabel>
                <Select
                  label="狀態"
                  value={editForm.status}
                  onChange={(e) => handleEditChange("status", e.target.value)}
                >
                  <MenuItem value="todo">待辦</MenuItem>
                  <MenuItem value="in_progress">進行中</MenuItem>
                  <MenuItem value="done">已完成</MenuItem>
                </Select>
              </FormControl>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setEditOpen(false)}>取消</Button>
              <Button onClick={saveEdit} variant="contained">儲存</Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </Box>
  );
}

/* ===========================
   ✅ [優化] TaskCard 子元件
   - 使用 React.memo：當 props（task, onEdit, onDelete）沒有改變時不重渲染
   - 搭配上方 useCallback 穩定 handler，列表大時能明顯降低重繪成本
=========================== */
const TaskCard = React.memo(function TaskCard({ task, onEdit, onDelete }) {
  return (
    <Card sx={{ height: "100%", borderRadius: 3, boxShadow: 3 }}>
      <CardContent>
        <Typography variant="h6">{task.title}</Typography>
        <Typography variant="body2" color="text.secondary">
          {task.description}
        </Typography>
        <Typography variant="caption" display="block">
          狀態：{task.statusLabel}
        </Typography>

        {/* ✅ 將按鈕移進 CardContent，讓測試用 closest('div') 能包含到這兩顆按鈕 */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, pt: 2 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => onEdit(task)}
          >
            編輯
          </Button>
          <Button
            variant="contained"
            color="error"
            size="small"
            onClick={() => onDelete(task.id)}
          >
            刪除
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
});



// // src/pages/Dashboard.js
// import React, { useEffect, useMemo, useState } from "react";
// import {
//   Box, Typography, Grid, Card, CardContent, Button, Alert,
//   CircularProgress, Select, MenuItem, FormControl, InputLabel,
//   LinearProgress, Dialog, DialogTitle, DialogContent, DialogActions,
//   TextField
// } from "@mui/material";
// import { useNavigate } from "react-router-dom";
// import {
//   PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
//   LineChart, Line, XAxis, YAxis, CartesianGrid
// } from "recharts";
// import api from "../api"; // 你的 axios instance（自動帶 Authorization）

// /** 後端 ↔ 前端 顯示映射（後端用英文、畫面顯示中文） */
// const STATUS_LABEL = { todo: "待辦", in_progress: "進行中", done: "已完成" };
// const LABEL_STATUS = { "待辦": "todo", "進行中": "in_progress", "已完成": "done" };
// const COLORS = ["#8884d8", "#82ca9d", "#ffc658"];

// export default function Dashboard() {
//   const navigate = useNavigate();

//   /** 狀態 */
//   const [tasks, setTasks] = useState([]);          // 原始任務（後端回傳）
//   const [error, setError] = useState("");          // 錯誤訊息顯示
//   const [loading, setLoading] = useState(true);    // 初次載入用
//   const [statusFilter, setStatusFilter] = useState("全部"); // 篩選（中文）

//   /** 編輯用的 Dialog 狀態 */
//   const [editOpen, setEditOpen] = useState(false);
//   const [editForm, setEditForm] = useState({
//     id: null, title: "", description: "", status: "todo",
//   });

//   /** 首次進入頁面：檢查 token、讀取任務 */
//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     if (!token) {
//       setError("未授權，請先登入");
//       navigate("/login");
//       return;
//     }
//     fetchTasks();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   /** 從後端讀取任務（Read） */
//   const fetchTasks = async () => {
//     try {
//       const res = await api.get("/tasks"); // 已在 api instance 夾 Authorization
//       setTasks(res.data || []);
//     } catch (err) {
//       console.error("❌ 讀取任務失敗：", err.response?.data || err.message);
//       setError("無法載入任務");
//     } finally {
//       setLoading(false);
//     }
//   };

//   /** 依目前篩選（中文）回傳畫面要顯示的任務（英文比對、中文顯示） */
//   const viewTasks = useMemo(() => {
//     const filtered = tasks.filter((t) =>
//       statusFilter === "全部" ? true : t.status === LABEL_STATUS[statusFilter]
//     );
//     return filtered.map((t) => ({
//       ...t,
//       statusLabel: STATUS_LABEL[t.status] ?? t.status, // 顯示中文
//     }));
//   }, [tasks, statusFilter]);

//   /** 圓環圖資料（以英文 status 統計） */
//   const statusData = useMemo(() => {
//     const counts = { todo: 0, in_progress: 0, done: 0 };
//     viewTasks.forEach((t) => {
//       if (t.status in counts) counts[t.status] += 1;
//     });
//     return [
//       { name: "待辦", value: counts.todo },
//       { name: "進行中", value: counts.in_progress },
//       { name: "已完成", value: counts.done },
//     ];
//   }, [viewTasks]);

//   /** 折線圖：依建立日期聚合（created_at / createdAt 都容錯） */
//   const trendData = useMemo(() => {
//     const acc = {};
//     tasks.forEach((t) => {
//       const raw = t.created_at || t.createdAt;
//       if (!raw) return;
//       const date = new Date(raw).toISOString().split("T")[0];
//       acc[date] = (acc[date] || 0) + 1;
//     });
//     return Object.entries(acc).map(([date, count]) => ({ date, count }));
//   }, [tasks]);

//   /** 完成率 */
//   const total = viewTasks.length;
//   const completed = viewTasks.filter((t) => t.status === "done").length;
//   const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

//   /** --- 以下為 Update / Delete 相關方法 --- */

//   /** 開啟編輯框（把該卡片的資料帶入對話框） */
//   const openEdit = (task) => {
//     setEditForm({
//       id: task.id,
//       title: task.title,
//       description: task.description || "",
//       status: task.status, // 後端認得英文：todo | in_progress | done
//     });
//     setEditOpen(true);
//   };

//   /** 編輯框輸入綁定 */
//   const handleEditChange = (field, value) => {
//     setEditForm((f) => ({ ...f, [field]: value }));
//   };

//   /** 儲存（Update：PUT /tasks/:id） */
//   const saveEdit = async () => {
//     try {
//       const body = {
//         title: editForm.title.trim(),
//         description: editForm.description.trim(),
//         status: editForm.status,
//       };
//       if (!body.title) {
//         setError("標題不可為空");
//         return;
//       }
//       const { data } = await api.put(`/tasks/${editForm.id}`, body);

//       // 用回傳覆蓋本地對應任務，觸發 UI/圖表重算
//       setTasks((prev) => prev.map((t) => (t.id === editForm.id ? { ...t, ...data } : t)));
//       setEditOpen(false);
//     } catch (err) {
//       console.error("更新失敗：", err.response?.data || err.message);
//       setError(err.response?.data?.message || "更新失敗");
//     }
//   };

//   /** 刪除（Delete：DELETE /tasks/:id） */
//   const deleteTask = async (id) => {
//     const ok = window.confirm("確定要刪除這個任務嗎？此動作無法復原。");
//     if (!ok) return;
//     try {
//       await api.delete(`/tasks/${id}`);
//       // 從本地列表移除，觸發 UI/圖表重算
//       setTasks((prev) => prev.filter((t) => t.id !== id));
//     } catch (err) {
//       console.error("刪除失敗：", err.response?.data || err.message);
//       setError(err.response?.data?.message || "刪除失敗");
//     }
//   };

//   return (
//     <Box sx={{ p: 4 }}>
//       <Typography variant="h4" gutterBottom>🎉 歡迎來到 Dashboard</Typography>
//       <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
//         這裡是你的任務總覽
//       </Typography>

//       {error && <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>}

//       {loading ? (
//         <Box textAlign="center" mt={4}><CircularProgress /></Box>
//       ) : (
//         <>
//           {/* 篩選 + 新增 */}
//           <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", mb: 4 }}>
//             <FormControl sx={{ minWidth: 150 }}>
//               <InputLabel>狀態篩選</InputLabel>
//               <Select
//                 value={statusFilter}
//                 label="狀態篩選"
//                 onChange={(e) => setStatusFilter(e.target.value)}
//               >
//                 <MenuItem value="全部">全部</MenuItem>
//                 <MenuItem value="待辦">待辦</MenuItem>
//                 <MenuItem value="進行中">進行中</MenuItem>
//                 <MenuItem value="已完成">已完成</MenuItem>
//               </Select>
//             </FormControl>
//             <Button variant="contained" onClick={() => navigate("/create-task")}>
//               ➕ 新增任務
//             </Button>
//           </Box>

//           {/* 圖表 */}
//           <Grid container spacing={4} mb={4}>
//             <Grid item xs={12} md={6}>
//               <Typography variant="h6" gutterBottom>任務狀態圓環圖</Typography>
//               <ResponsiveContainer width="100%" height={300}>
//                 <PieChart>
//                   <Pie data={statusData} dataKey="value" nameKey="name"
//                        cx="50%" cy="50%" innerRadius={60} outerRadius={80} label>
//                     {statusData.map((entry, i) => (
//                       <Cell key={i} fill={COLORS[i % COLORS.length]} />
//                     ))}
//                   </Pie>
//                   <Tooltip />
//                 </PieChart>
//               </ResponsiveContainer>
//             </Grid>

//             <Grid item xs={12} md={6}>
//               <Typography variant="h6" gutterBottom>任務建立趨勢</Typography>
//               <ResponsiveContainer width="100%" height={300}>
//                 <LineChart data={trendData}>
//                   <CartesianGrid strokeDasharray="3 3" />
//                   <XAxis dataKey="date" />
//                   <YAxis />
//                   <Tooltip />
//                   <Line type="monotone" dataKey="count" />
//                 </LineChart>
//               </ResponsiveContainer>
//             </Grid>

//             {/* 完成率 */}
//             <Grid item xs={12}>
//               <Card sx={{ p: 2 }}>
//                 <Typography variant="h6" gutterBottom>✅ 完成率</Typography>
//                 <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
//                   <Box sx={{ flexGrow: 1 }}>
//                     <LinearProgress variant="determinate" value={rate}
//                       sx={{ height: 10, borderRadius: 5 }} />
//                   </Box>
//                   <Typography variant="body2" color="text.secondary">
//                     {`${completed} / ${total} (${rate}%)`}
//                   </Typography>
//                 </Box>
//               </Card>
//             </Grid>
//           </Grid>

//           {/* 任務列表 */}
//           <Grid container spacing={3}>
//             {viewTasks.map((task) => (
//               <Grid item xs={12} sm={6} md={4} key={task.id}>
//                 <Card sx={{ height: "100%", borderRadius: 3, boxShadow: 3 }}>
//                   <CardContent>
//                     <Typography variant="h6">{task.title}</Typography>
//                     <Typography variant="body2" color="text.secondary">
//                       {task.description}
//                     </Typography>
//                     <Typography variant="caption" display="block">
//                       狀態：{task.statusLabel}
//                     </Typography>
//                   </CardContent>
//                   <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, p: 2 }}>
//                     <Button variant="outlined" size="small" onClick={() => openEdit(task)}>
//                       編輯
//                     </Button>
//                     <Button variant="contained" color="error" size="small" onClick={() => deleteTask(task.id)}>
//                       刪除
//                     </Button>
//                   </Box>
//                 </Card>
//               </Grid>
//             ))}
//           </Grid>

//           {/* 編輯對話框（Update） */}
//           <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="sm">
//             <DialogTitle>編輯任務</DialogTitle>
//             <DialogContent sx={{ pt: 2, display: "grid", gap: 2 }}>
//               <TextField
//                 label="標題"
//                 value={editForm.title}
//                 onChange={(e) => handleEditChange("title", e.target.value)}
//                 required
//               />
//               <TextField
//                 label="描述"
//                 value={editForm.description}
//                 onChange={(e) => handleEditChange("description", e.target.value)}
//                 multiline
//                 minRows={3}
//               />
//               <FormControl>
//                 <InputLabel>狀態</InputLabel>
//                 <Select
//                   label="狀態"
//                   value={editForm.status}
//                   onChange={(e) => handleEditChange("status", e.target.value)}
//                 >
//                   <MenuItem value="todo">待辦</MenuItem>
//                   <MenuItem value="in_progress">進行中</MenuItem>
//                   <MenuItem value="done">已完成</MenuItem>
//                 </Select>
//               </FormControl>
//             </DialogContent>
//             <DialogActions>
//               <Button onClick={() => setEditOpen(false)}>取消</Button>
//               <Button onClick={saveEdit} variant="contained">儲存</Button>
//             </DialogActions>
//           </Dialog>
//         </>
//       )}
//     </Box>
//   );
// }
