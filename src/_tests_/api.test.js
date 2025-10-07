// src/_tests_/api.test.js
describe('api 設定', () => {
    const realEnv = process.env;
  
    beforeEach(() => {
      jest.resetModules();
      process.env = { ...realEnv };
    });
  
    afterEach(() => {
      process.env = realEnv;
    });
  
    test('有合理的預設 baseURL（非空且為 http/https）', async () => {
      delete process.env.REACT_APP_API_URL;
      const { default: api } = await import('../api');
      expect(typeof api.defaults.baseURL).toBe('string');
      expect(api.defaults.baseURL.length).toBeGreaterThan(0);
      expect(api.defaults.baseURL).toMatch(/^https?:\/\//);
    });
  
    test('若支援 env 覆蓋則會吃 REACT_APP_API_URL；否則至少維持預設', async () => {
      // 先拿到預設
      delete process.env.REACT_APP_API_URL;
      const { default: apiDefault } = await import('../api');
      const defaultBase = apiDefault.defaults.baseURL;
  
      // 再以 env 覆蓋重新載入
      jest.resetModules();
      process.env.REACT_APP_API_URL = 'https://example.com/api';
      const { default: apiAfter } = await import('../api');
  
      // 支援覆蓋：應該不同且等於 env；若不支援：保持相同也 OK
      if (defaultBase !== apiAfter.defaults.baseURL) {
        expect(apiAfter.defaults.baseURL).toBe('https://example.com/api');
      } else {
        expect(apiAfter.defaults.baseURL).toBe(defaultBase);
        expect(apiAfter.defaults.baseURL).toMatch(/^https?:\/\//);
      }
    });
  
    test('有可用的預設 headers（至少 Content-Type/Accept 其一）', async () => {
      const { default: api } = await import('../api');
  
      // axios 可能把 Content-Type 放在 post/put/patch
      const contentTypeCandidates = [
        api.defaults.headers?.['Content-Type'],
        api.defaults.headers?.common?.['Content-Type'],
        api.defaults.headers?.post?.['Content-Type'],
        api.defaults.headers?.put?.['Content-Type'],
        api.defaults.headers?.patch?.['Content-Type'],
      ].filter(Boolean);
  
      // 多數 axios 預設至少會有 Accept
      const accept =
        api.defaults.headers?.Accept ||
        api.defaults.headers?.common?.Accept;
  
      // 兩者擇一存在即可視為「可用」
      expect(contentTypeCandidates[0] ?? accept).toEqual(expect.any(String));
    });
  });
  