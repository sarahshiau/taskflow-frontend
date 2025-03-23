import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from '../pages/Login';
import { MemoryRouter } from 'react-router-dom';
import { login } from '../api';

// ✅ Mock useNavigate，因為你在 Login.js 有用 navigate()
const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// ✅ Mock login() function（避免真的呼叫 API）
jest.mock('../api', () => ({
  login: jest.fn(),
}));

describe('Login Page', () => {
  beforeEach(() => {
    // 每次測試前都重置
    mockNavigate.mockReset();
    login.mockReset();
  });

  test('畫面上顯示「登入 TaskFlow」標題', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    expect(screen.getByText(/登入 TaskFlow/i)).toBeInTheDocument();
  });

  test('可以輸入 email 和 密碼', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByLabelText(/密碼/i);

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('password123');
  });

  test('點擊登入後 ➜ 成功呼叫 login 並跳轉 dashboard', async () => {
    // 模擬成功登入回傳 token
    login.mockResolvedValue({ data: { token: 'mock-token' } });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByLabelText(/密碼/i);
    const loginButton = screen.getByRole('button', { name: /登入/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    fireEvent.click(loginButton);

    await waitFor(() => {
      // 測試 login 被呼叫
      expect(login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });

      // 測試 navigate 被呼叫到 dashboard
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  test('點擊「沒有帳號？前往註冊」跳轉 /register', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    const registerButton = screen.getByRole('button', { name: /沒有帳號/i });

    fireEvent.click(registerButton);

    expect(mockNavigate).toHaveBeenCalledWith('/register');
  });

  test('欄位沒填 ➜ 出現錯誤訊息', async () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    const loginButton = screen.getByRole('button', { name: /登入/i });

    fireEvent.click(loginButton);

    // 錯誤訊息出現
    expect(await screen.findByText(/請填寫所有欄位/i)).toBeInTheDocument();

    // 不會送出 login
    expect(login).not.toHaveBeenCalled();
  });
});
