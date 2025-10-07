// src/context/UIContext.jsx
import React, { createContext, useContext, useState, useCallback } from "react";
import { Snackbar, Alert } from "@mui/material";

// ✅ [hook] useContext 的根：先建立一個 Context 物件
const UIContext = createContext(null);

export function UIProvider({ children }) {
  // 全域的 toast 狀態
  const [snack, setSnack] = useState({ open: false, msg: "", severity: "info" });

  // 對外暴露的 API：showToast("訊息", "success" | "error" | "info" | "warning")
  const showToast = useCallback((msg, severity = "info") => {
    setSnack({ open: true, msg, severity });
  }, []);
  const closeToast = () => setSnack((s) => ({ ...s, open: false }));

  return (
    // ✅ [hook] Provider 提供 value，子孫元件就能用 useContext 取用
    <UIContext.Provider value={{ showToast }}>
      {children}

      {/* 這個 Snackbar 會常駐在最外層：任何頁面呼叫 showToast 都會彈出 */}
      <Snackbar
        open={snack.open}
        autoHideDuration={2500}
        onClose={closeToast}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert elevation={3} variant="filled" onClose={closeToast} severity={snack.severity}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </UIContext.Provider>
  );
}

// ✅ [hook] 自訂 hook：在任何子元件用 useUI() 就能拿到 showToast（本質是 useContext）
export const useUI = () => useContext(UIContext);
