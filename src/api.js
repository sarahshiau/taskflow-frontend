// src/api.js

/* eslint-disable global-require */
const axios = (function () {
  try {
    // 在部分 Jest 環境下，直接 import 'axios' 會選到 ESM 入口引發錯誤
    // 改成使用 CJS 版本，避免 "Cannot use import statement outside a module"
    // 若未來 axios 目錄結構有變，再回退成 require('axios')
    // 注意：此檔目前未在 Login 使用（Login 改走 ../api/auth）
    // 但留著可給其他頁面共用。
    return require('axios/dist/node/axios.cjs');
  } catch (e) {
    try {
      return require('axios');
    } catch {
      throw e;
    }
  }
}());

// ✅ [設定] 基底 URL：優先環境變數，否則本機 5001
const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5001';

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

export default api;

// // src/api.js
// import axios from "axios";

// // ✅ [設定] 基底 URL：優先用環境變數，否則退回本機 5001
// const BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5001";

// const api = axios.create({
//   baseURL: BASE_URL,                         // ★ 關鍵：讓 /register、/login、/tasks 打到後端
//   withCredentials: false,
//   headers: { "Content-Type": "application/json" },
// });

// // ✅ [除錯] 開發時印出 baseURL，方便確認不是 3000
// if (process.env.NODE_ENV === "development") {
//   // eslint-disable-next-line no-console
//   console.log("✅ api baseURL =", api.defaults.baseURL);
// }

// // ✅ [優化] 出站統一加上 Authorization
// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem("token"); // 可搭配 Login 成功後寫入
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });

// // ✅ [優化] 401 時清 token 並回登入（避免壞掉狀態）
// api.interceptors.response.use(
//   (res) => res,
//   (err) => {
//     if (err?.response?.status === 401) {
//       localStorage.removeItem("token");
//       if (window.location.pathname !== "/login") {
//         window.location.replace("/login");
//       }
//     }
//     return Promise.reject(err);
//   }
// );

// export default api;





// // import axios from 'axios';
// // import API_BASE_URL from './config';

// // export const login = async ({ email, password }) => {
// //   console.log('✅ login 呼叫 API:', email, password);

// //   const res = await axios.post(
// //     `${API_BASE_URL}/login`,
// //     { email, password },
// //     {
// //       headers: {
// //         'Content-Type': 'application/json',
// //       },
// //     }
// //   );

// //   return res;
// // };

// // export const register = async (username, email, password) => {
// //   const res = await axios.post(
// //     `${API_BASE_URL}/register`,
// //     { username, email, password },
// //     {
// //       headers: {
// //         'Content-Type': 'application/json',
// //       },
// //     }
// //   );

// //   return res.data;
// // };

// // ///////
// // // const instance = axios.create({
// // //   baseURL: process.env.REACT_APP_API_URL, // 自動依據環境變數切換
// // //   headers: {
// // //     "Content-Type": "application/json",
// // //   },
// // // });
// // const instance = axios.create({
// //   baseURL: "http://localhost:5001", // 本地測試用
// //   headers: {
// //     "Content-Type": "application/json",
// //   },
// // });

// // instance.interceptors.request.use(
// //   (config) => {
// //     const token = localStorage.getItem("token");
// //     if (token) {
// //       config.headers.Authorization = `Bearer ${token}`;
// //     }
// //     return config;
// //   },
// //   (error) => Promise.reject(error)
// // );

// // export default instance;