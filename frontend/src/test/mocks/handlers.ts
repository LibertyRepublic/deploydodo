import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('*/api/health', () =>
    HttpResponse.json({ status: 'ok' }),
  ),

  http.get('*/api/status', () =>
    HttpResponse.json({
      isAdminOnboarded: true,
      isServerSetup: true,
      isProjectSetup: false,
      isOnboardingComplete: false,
    }),
  ),

  http.post('*/api/auth/login', async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string };
    if (body.email === 'admin@test.com' && body.password === 'password123') {
      return HttpResponse.json({ sessionToken: 'test-session-token' });
    }
    return new HttpResponse(
      JSON.stringify({ error: 'invalid credentials' }),
      { status: 401 },
    );
  }),

  http.get('*/api/auth/validate', ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    if (authHeader === 'Bearer test-session-token') {
      return HttpResponse.json({ valid: true });
    }
    return new HttpResponse(null, { status: 401 });
  }),

  http.post('*/api/setup/admin', async ({ request }) => {
    const body = (await request.json()) as {
      name: string;
      email: string;
      password: string;
    };
    if (body.password.length < 8) {
      return new HttpResponse(
        JSON.stringify({ error: 'Password must be at least 8 characters' }),
        { status: 422 },
      );
    }
    return HttpResponse.json(
      {
        id: 1,
        name: body.name,
        email: body.email,
        accountType: 'admin',
        createdAt: new Date().toISOString(),
        sessionToken: 'new-session-token',
      },
      { status: 201 },
    );
  }),

  http.post('*/api/setup/server/local', () =>
    HttpResponse.json(
      {
        id: 1,
        name: 'local-server',
        serverType: 'local',
        hostname: 'localhost',
        port: null,
      },
      { status: 201 },
    ),
  ),

  http.post('*/api/setup/server/remote', () =>
    HttpResponse.json({ jobId: 'job-123' }, { status: 202 }),
  ),

  http.get('*/api/servers', () =>
    HttpResponse.json([
      {
        id: 1,
        name: 'Test Server',
        serverType: 'local',
        hostname: 'localhost',
        sshPort: null,
      },
    ]),
  ),

  http.get('*/api/jobs/:jobId/events', () =>
    new HttpResponse(
      'event: progress\ndata: {"steps":[]}\n\n',
      {
        headers: { 'Content-Type': 'text/event-stream' },
      },
    ),
  ),
];
