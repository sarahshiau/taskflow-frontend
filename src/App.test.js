// src/App.test.js
import { expect, test } from '@jest/globals';

test('測試環境啟動成功（smoke test）', () => {
  // 只驗證 jsdom 與 Jest 正常運作
  const el = document.createElement('div');
  document.body.appendChild(el);
  expect(document.body.contains(el)).toBe(true);
});
