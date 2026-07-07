import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { handlers as sharedHandlers } from './mocks/handlers';

const BASE = 'http://localhost';

const server = setupServer(...sharedHandlers);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('API integration', () => {
  describe('/api/health', () => {
    it('returns status ok', async () => {
      const response = await fetch(`${BASE}/api/health`);
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.status).toBe('ok');
    });
  });

  describe('/api/status', () => {
    it('returns config flags', async () => {
      const response = await fetch(`${BASE}/api/status`);
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.isAdminOnboarded).toBe(true);
      expect(data.isServerSetup).toBe(true);
    });

    it('handles server error', async () => {
      server.use(
        http.get(`${BASE}/api/status`, () =>
          new HttpResponse(null, { status: 500 }),
        ),
      );
      const response = await fetch(`${BASE}/api/status`);
      expect(response.status).toBe(500);
    });

    it('handles network error', async () => {
      server.use(
        http.get(`${BASE}/api/status`, () => HttpResponse.error()),
      );
      await expect(fetch(`${BASE}/api/status`)).rejects.toThrow();
    });
  });

  describe('/api/auth/login', () => {
    it('returns session token on valid credentials', async () => {
      const response = await fetch(`${BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@test.com', password: 'password123' }),
      });
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.sessionToken).toBe('test-session-token');
    });

    it('returns 401 on invalid credentials', async () => {
      const response = await fetch(`${BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'wrong@test.com', password: 'wrong' }),
      });
      expect(response.status).toBe(401);
    });
  });

  describe('/api/auth/validate', () => {
    it('returns 401 with invalid token', async () => {
      const response = await fetch(`${BASE}/api/auth/validate`, {
        headers: { Authorization: 'Bearer wrong-token' },
      });
      expect(response.status).toBe(401);
    });
  });
});
