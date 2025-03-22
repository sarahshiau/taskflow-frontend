import axios from "axios";

const API_URL = "http://localhost:5001"; // 確保和後端 PORT 一致

export const registerUser = async (userData) => {
  return axios.post(`${API_URL}/register`, userData);
};

export const loginUser = async (userData) => {
  return axios.post(`${API_URL}/login`, userData);
};
