import React, { useEffect, useState } from "react";
import { Box, Typography, Grid, Card, CardContent, Button, Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('未授權，請先登入');
      navigate('/login');
    } else {
      fetchTasks();
    }
  }, [navigate]);

  const fetchTasks = () => {
    const mockTasks = [
      { id: 1, title: "完成報告", description: "今天要交的專案報告", status: "待辦" },
      { id: 2, title: "會議準備", description: "明天的簡報資料", status: "進行中" },
      { id: 3, title: "健身房", description: "下班去運動", status: "已完成" },
    ];
    setTasks(mockTasks);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <Box sx={{ padding: 4 }}>
      {/* 標題 */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            🎉 歡迎來到 Dashboard
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            這裡是你的任務總覽
          </Typography>
        </Box>
      </Box>

      {/* 錯誤訊息 */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* 主要任務清單 */}
      <Grid container spacing={3}>
        {tasks.length === 0 ? (
          <Typography variant="body1" color="text.secondary">
            目前沒有任務
          </Typography>
        ) : (
          tasks.map((task) => (
            <Grid item xs={12} sm={6} md={4} key={task.id}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  borderRadius: 3,
                  boxShadow: 3,
                  transition: "0.3s",
                  "&:hover": { boxShadow: 6 },
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" component="div" gutterBottom>
                    {task.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {task.description}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                    狀態：{task.status}
                  </Typography>
                </CardContent>
                <Box sx={{ display: "flex", justifyContent: "flex-end", p: 2 }}>
                  <Button variant="contained" size="small">
                    查看詳情
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))
        )}
      </Grid>
    </Box>
  );
};

export default Dashboard;
