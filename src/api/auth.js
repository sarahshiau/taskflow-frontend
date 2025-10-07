// src/api/auth.js
import axios from 'axios';

/**
 * @param {{ email: string, password: string }} payload
 * @returns {Promise<any>} 伺服器回傳資料
 */
export async function login(payload) {
  const res = await axios.post('/api/auth/login', payload);
  return res.data;
}
