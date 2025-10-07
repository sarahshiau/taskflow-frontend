// src/_tests_/ProtectedRoute.test.jsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});

test('未登入時，進入受保護頁會被導到 /login', () => {
  render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <Routes>
        <Route path="/login" element={<div>Login Page</div>} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<div>Protected Content</div>} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
  expect(screen.getByText(/login page/i)).toBeInTheDocument();
  expect(screen.queryByText(/protected content/i)).not.toBeInTheDocument();
});

test('已登入時，能看到受保護內容（使用 Outlet）', () => {
  // 嘗試常見的 token key，避免與實作不一致
  localStorage.setItem('token', 'dummy');
  localStorage.setItem('TASKFLOW_TOKEN', 'dummy');
  sessionStorage.setItem('authToken', 'dummy');

  render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <Routes>
        <Route path="/login" element={<div>Login Page</div>} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<div>Protected Content</div>} />
        </Route>
      </Routes>
    </MemoryRouter>
  );

  expect(screen.getByText(/protected content/i)).toBeInTheDocument();
  expect(screen.queryByText(/login page/i)).not.toBeInTheDocument();
});
