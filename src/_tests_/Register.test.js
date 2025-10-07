// src/_tests_/Register.test.js
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import Register from '../pages/Register';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

let mockPost = jest.fn();
jest.mock('../api', () => ({
  __esModule: true,
  default: { post: (...args) => mockPost(...args) },
}));

const getSubmit = () =>
  screen.getByRole('button', { name: /(建立帳號|註冊)/i });

const fillForm = ({
  username = 'Sarah',
  email = 'test@example.com',
  password = '123456',
} = {}) => {
  fireEvent.change(screen.getByLabelText(/使用者名稱/i), { target: { value: username } });
  fireEvent.change(screen.getByLabelText(/email/i), { target: { value: email } });
  fireEvent.change(screen.getByLabelText(/密碼/i), { target: { value: password } });
};

describe('Register Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('載入時顯示「建立新帳號」標題，且「建立帳號」按鈕預設為 disabled', () => {
    render(<MemoryRouter><Register /></MemoryRouter>);
    expect(screen.getByRole('heading', { name: /建立新帳號/i })).toBeInTheDocument();
    expect(getSubmit()).toBeDisabled();
  });

  test('欄位填寫有效時按鈕變為可點擊', () => {
    render(<MemoryRouter><Register /></MemoryRouter>);
    const btn = getSubmit();
    expect(btn).toBeDisabled();
    fillForm();
    expect(btn).toBeEnabled();
  });

  test('註冊成功後呼叫 /register 並導回 /login', async () => {
    mockPost.mockResolvedValueOnce({ data: { message: '註冊成功' } });
    render(<MemoryRouter><Register /></MemoryRouter>);

    fillForm();
    fireEvent.click(getSubmit());

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith('/register', {
        username: 'Sarah',
        email: 'test@example.com',
        password: '123456',
      });
    });

    // 你的實作是 navigate('/login', { replace: true })
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login', expect.objectContaining({ replace: true }));
    });
  });

  test('註冊失敗時不導頁（顯示錯誤訊息與否視 UI 而定）', async () => {
    mockPost.mockRejectedValueOnce({ response: { data: { message: 'Email 已被使用' } } });
    render(<MemoryRouter><Register /></MemoryRouter>);

    fillForm({ email: 'dup@example.com' });
    fireEvent.click(getSubmit());

    await waitFor(() => expect(mockPost).toHaveBeenCalled());
    // 最小保證：不應導頁
    expect(mockNavigate).not.toHaveBeenCalled();

    // 如果未來 UI 有用 <Alert role="alert"> 或 Snackbar 呈現訊息，可再加上：
    // expect(await screen.findByRole('alert')).toHaveTextContent(/Email 已被使用/i);
  });
});
