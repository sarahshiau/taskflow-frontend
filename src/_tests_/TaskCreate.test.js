import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TaskCreate from '../pages/TaskCreate';

// ✅ 用 "mock" 前綴
const mockShowToast = jest.fn();
jest.mock('../context/UIContext', () => ({
  useUI: () => ({ showToast: mockShowToast }),
}));

const mockApiPost = jest.fn();
jest.mock('../api', () => ({
  __esModule: true,
  default: {
    post: (...args) => mockApiPost(...args),
  },
}));

beforeEach(() => {
  mockShowToast.mockClear();
  mockApiPost.mockReset();
});

const renderCreate = () => render(<TaskCreate />);

test('初始：提交按鈕為 disabled，且自動聚焦在「標題」', () => {
  renderCreate();
  const btn = screen.getByRole('button', { name: /新增任務/i });
  expect(btn).toBeDisabled();

  const titleInput = screen.getByLabelText(/標題/i);
  expect(document.activeElement).toBe(titleInput);
});

test('成功新增：清空表單＋成功 toast', async () => {
  mockApiPost.mockResolvedValueOnce({ data: { id: 99 } });

  renderCreate();

  const titleInput = screen.getByLabelText(/標題/i);
  const descInput = screen.getByLabelText(/描述/i);

  fireEvent.change(titleInput, { target: { value: '新任務' } });
  fireEvent.change(descInput, { target: { value: '說明' } });

  const btn = screen.getByRole('button', { name: /新增任務/i });
  expect(btn).not.toBeDisabled();

  fireEvent.click(btn);

  await waitFor(() => {
    expect(mockShowToast).toHaveBeenCalledWith('✅ 任務已新增！', 'success');
  });

  expect(titleInput).toHaveValue('');
  expect(descInput).toHaveValue('');
  expect(screen.getByRole('button', { name: /新增任務/i })).toBeDisabled();

  expect(mockApiPost).toHaveBeenCalledWith('/tasks', expect.objectContaining({
    title: '新任務',
    description: '說明',
  }));
});

test('失敗新增：顯示 error toast', async () => {
  mockApiPost.mockRejectedValueOnce(new Error('fail'));

  renderCreate();

  fireEvent.change(screen.getByLabelText(/標題/i), { target: { value: '壞掉案例' } });
  fireEvent.click(screen.getByRole('button', { name: /新增任務/i }));

  await waitFor(() => {
    const firstMsg = mockShowToast.mock.calls[0]?.[0] || '';
    expect(firstMsg).toMatch(/❌\s*新增失敗/i);
  });
});
