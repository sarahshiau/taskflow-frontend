import '@testing-library/jest-dom';

// ResizeObserver（給 Recharts/MUI 用，避免 jsdom 崩）
class StubResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.ResizeObserver = StubResizeObserver;

// 強制覆寫瀏覽器對話框，避免 jsdom 噴錯
window.alert = jest.fn();
window.confirm = jest.fn(() => true);
