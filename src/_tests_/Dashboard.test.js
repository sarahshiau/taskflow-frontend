// src/_tests_/Dashboard.test.js
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';

// ✅ 用 "mock" 前綴避免 out-of-scope 問題
const mockShowToast = jest.fn();
jest.mock('../context/UIContext', () => ({
  useUI: () => ({ showToast: mockShowToast }),
}));

// ✅ 直接 mock 你的 axios instance（../api）
const mockApiGet = jest.fn();
const mockApiPut = jest.fn();
const mockApiDelete = jest.fn();

jest.mock('../api', () => ({
  __esModule: true,
  default: {
    get: (...args) => mockApiGet(...args),
    put: (...args) => mockApiPut(...args),
    delete: (...args) => mockApiDelete(...args),
  },
}));

const renderDash = () =>
  render(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>
  );

const fixtures = [
  { id: 1, title: '第一個任務', description: 'demo', status: 'todo', createdAt: '2024-01-01' },
  { id: 2, title: '已完成任務', description: 'bar', status: 'done', createdAt: '2024-01-02' },
];

beforeEach(() => {
  localStorage.setItem('token', 'test-token');
  mockShowToast.mockClear();
  mockApiGet.mockReset();
  mockApiPut.mockReset();
  mockApiDelete.mockReset();
});

afterEach(() => {
  localStorage.clear();
});

test('載入後能看到任務（第一個任務 / 已完成任務）', async () => {
  mockApiGet.mockResolvedValueOnce({ data: fixtures });
  renderDash();

  expect(await screen.findByText(/第一個任務/i)).toBeInTheDocument();
  expect(screen.getByText(/已完成任務/i)).toBeInTheDocument();
});

test('編輯任務成功：更新卡片＋success toast', async () => {
  mockApiGet.mockResolvedValueOnce({ data: fixtures });
  mockApiPut.mockResolvedValueOnce({
    data: { ...fixtures[0], title: '第一個任務-改' },
  });

  renderDash();

  const editBtns = await screen.findAllByRole('button', { name: /編輯/i });
  fireEvent.click(editBtns[0]);

  // ✅ 放寬 label 匹配，因為 MUI 會顯示「標題 *」
  const dialog = await screen.findByRole('dialog', { name: /編輯任務/i });
  const titleInput = within(dialog).getByLabelText(/標題/i);

  fireEvent.change(titleInput, { target: { value: '第一個任務-改' } });
  fireEvent.click(within(dialog).getByRole('button', { name: /儲存/i }));

  expect(await screen.findByText(/第一個任務-改/i)).toBeInTheDocument();
  expect(mockShowToast).toHaveBeenCalledWith('✅ 已更新任務', 'success');
  expect(mockApiPut).toHaveBeenCalledWith('/tasks/1', expect.objectContaining({ title: '第一個任務-改' }));
});

test('編輯驗證：空標題會保留在對話框且不送出', async () => {
  mockApiGet.mockResolvedValueOnce({ data: fixtures });
  renderDash();

  const editBtns = await screen.findAllByRole('button', { name: /編輯/i });
  fireEvent.click(editBtns[0]);

  const dialog = await screen.findByRole('dialog', { name: /編輯任務/i });
  const titleInput = within(dialog).getByLabelText(/標題/i);

  fireEvent.change(titleInput, { target: { value: '' } });
  fireEvent.click(within(dialog).getByRole('button', { name: /儲存/i }));

  // ✅ 驗證重點：沒有打 API、對話框還在、輸入仍為空
  await waitFor(() => expect(mockApiPut).not.toHaveBeenCalled());
  expect(within(dialog).getByLabelText(/標題/i)).toHaveValue('');
  expect(dialog).toBeInTheDocument();
});

test('刪除任務成功：卡片移除＋success toast', async () => {
  mockApiGet.mockResolvedValueOnce({ data: fixtures });
  mockApiDelete.mockResolvedValueOnce({});
  jest.spyOn(window, 'confirm').mockReturnValue(true);

  renderDash();

  expect(await screen.findByText(/第一個任務/i)).toBeInTheDocument();
  const delBtn = screen.getAllByRole('button', { name: /刪除/i })[0];
  fireEvent.click(delBtn);

  await waitFor(() => {
    expect(screen.queryByText(/第一個任務/i)).not.toBeInTheDocument();
  });

  expect(mockShowToast).toHaveBeenCalledWith('🗑️ 已刪除任務', 'success');
  expect(mockApiDelete).toHaveBeenCalledWith('/tasks/1');
});

test('GET /tasks 失敗會顯示錯誤 Alert', async () => {
  mockApiGet.mockRejectedValueOnce(new Error('boom'));
  renderDash();

  expect(await screen.findByText(/無法載入任務/i)).toBeInTheDocument();
});

test('空資料時圖表也能渲染（不崩潰）', async () => {
  mockApiGet.mockResolvedValueOnce({ data: [] });
  renderDash();

  // 等待載入完成（看到「✅ 完成率」卡片）
  const rateHeading = await screen.findByText(/✅ 完成率/);
  const rateCard = rateHeading.closest('div');

  // 顯示 0 / 0 (0%) 的摘要
  expect(within(rateCard).getByText(/0\s*\/\s*0\s*\(0%\)/)).toBeInTheDocument();

  // 也可保險驗證進度條屬性
  const progressbar = within(rateCard).getByRole('progressbar');
  expect(progressbar).toHaveAttribute('aria-valuenow', '0');
});
