import axios from 'axios';
import API_BASE_URL from './config';

export const login = async ({ email, password }) => {
  console.log('✅ login 呼叫 API:', email, password);

  const res = await axios.post(
    `${API_BASE_URL}/login`,
    { email, password },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  return res;
};

export const register = async (username, email, password) => {
  const res = await axios.post(
    `${API_BASE_URL}/register`,
    { username, email, password },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  return res.data;
};
