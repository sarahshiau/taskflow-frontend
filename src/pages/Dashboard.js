import React from "react";
import { Box, Typography, Grid, Card, CardContent, Button } from "@mui/material";

const Dashboard = () => {
  // 假設這裡是後端撈來的 task 資料
  const tasks = [
    { id: 1, title: "完成報告", description: "今天要交的專案報告", status: "待辦" },
    { id: 2, title: "會議準備", description: "明天的簡報資料", status: "進行中" },
    { id: 3, title: "健身房", description: "下班去運動", status: "已完成" },
  ];

  return (
    <Box sx={{ padding: 4 }}>
      {/* 標題 */}
      <Typography variant="h4" component="h1" gutterBottom>
        🎉 歡迎來到 Dashboard
      </Typography>

      {/* 子標題 */}
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        這裡是你的任務總覽
      </Typography>

      {/* 主要任務清單 */}
      <Grid container spacing={3} mt={2}>
        {tasks.map((task) => (
          <Grid item xs={12} sm={6} md={4} key={task.id}>
            <Card sx={{ height: "100%", display: "flex", flexDirection: "column", borderRadius: 3, boxShadow: 3 }}>
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
              <Box sx={{ display: "flex", justifyContent: "flex-end", padding: 2 }}>
                <Button variant="contained" size="small">
                  查看詳情
                </Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Dashboard;
