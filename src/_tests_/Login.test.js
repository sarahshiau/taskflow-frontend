// src/_tests_/Login.test.js

// ---- 先 mock ../api（不要引用外部變數，避免 TDZ）----
jest.mock('../api', () => {
  const post = jest.fn();
  return {
    __esModule: true,
    default: { post },
  };
});

// ---- mock useNavigate ----
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// ---- 正常 import ----
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from '../pages/Login';
import api from '../api';

// ---- 共用 setup ----
beforeAll(() => {
  // 避免 jsdom 對 alert Not implemented
  window.alert = jest.fn();
});

beforeEach(() => {
  jest.clearAllMocks();
  mockNavigate.mockReset();
  // 由於我們從 ../api 匯入的是同一個被 mock 的物件，直接重置 post
  api.post.mockReset();
  localStorage.clear();
});

describe('Login Page', () => {
  test('畫面上顯示「登入」標題，且初始按鈕為 disabled', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    // 用 heading role 避免和「登入」按鈕衝突
    expect(screen.getByRole('heading', { name: '登入' })).toBeInTheDocument();

    // 初始登入按鈕應該 disabled
    expect(screen.getByRole('button', { name: /登入/i })).toBeDisabled();
  });

  test('可以輸入 email/密碼，點擊登入後呼叫 API 並導到 /dashboard', async () => {
    api.post.mockResolvedValueOnce({ data: { token: 'fake-token' } });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    // 填表單
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText('密碼（至少 6 碼）'), {
      target: { value: 'password123' },
    });

    // 按鈕應啟用
    const loginBtn = screen.getByRole('button', { name: /登入/i });
    expect(loginBtn).toBeEnabled();

    // 送出
    fireEvent.click(loginBtn);

    // 等待 API 被呼叫與導頁
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledTimes(1);
      expect(api.post).toHaveBeenCalledWith('/login', {
        email: 'test@example.com',
        password: 'password123',
      });
      expect(localStorage.getItem('token')).toBe('fake-token');
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
    });
  });
});
