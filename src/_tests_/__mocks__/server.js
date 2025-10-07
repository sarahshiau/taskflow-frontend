// src/_tests_/__mocks__/server.js
import { rest } from 'msw';
import { setupServer } from 'msw/node';

// 初始「假資料」
const initial = [
  { id: 1, title: '第一個任務', description: 'demo', status: 'todo', createdAt: '2024-01-01' },
  { id: 2, title: '已完成任務', description: 'bar',  status: 'done', createdAt: '2024-01-02' },
];

let db = initial.map(t => ({ ...t }));

export const resetDb = () => {
  db = initial.map(t => ({ ...t }));
};

export const handlers = [
  // 讀取任務列表
  rest.get('*/tasks', (req, res, ctx) => {
    return res(ctx.delay(50), ctx.json(db));
  }),

  // 新增任務
  rest.post('*/tasks', async (req, res, ctx) => {
    const body = await req.json();
    const id = Math.max(0, ...db.map(t => t.id)) + 1;
    const newTask = {
      id,
      title: body.title ?? '',
      description: body.description ?? '',
      status: body.status ?? 'todo',
      createdAt: new Date().toISOString(),
    };
    db.push(newTask);
    return res(ctx.status(201), ctx.json(newTask));
  }),

  // 更新任務
  rest.put('*/tasks/:id', async (req, res, ctx) => {
    const id = Number(req.params.id);
    const body = await req.json();
    db = db.map(t => (t.id === id ? { ...t, ...body } : t));
    const updated = db.find(t => t.id === id);
    return res(ctx.json(updated));
  }),

  // 刪除任務
  rest.delete('*/tasks/:id', (req, res, ctx) => {
    const id = Number(req.params.id);
    db = db.filter(t => t.id !== id);
    return res(ctx.status(204));
  }),
];

export const server = setupServer(...handlers);
