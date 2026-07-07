import { test, expect } from '@playwright/test';

test.describe('Navigation and auth redirects', () => {
  test.beforeEach(async ({ page }) => {
    await page.evaluate(() => localStorage.clear());
  });

  test('redirects to /login when no session token', async ({ page }) => {
    await page.goto('/');
    await page.waitForURL('**/login');
    expect(page.url()).toContain('/login');
  });

  test('redirects to /login when token is invalid', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('session_token', 'invalid-token');
    });
    await page.goto('/dashboard');
    await page.waitForURL('**/login');
    expect(page.url()).toContain('/login');
  });
});

test.describe('Login page', () => {
  test.beforeEach(async ({ page }) => {
    await page.evaluate(() => localStorage.clear());
    await page.goto('/login');
  });

  test('displays login form with email and password fields', async ({ page }) => {
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /log in|sign in/i })).toBeVisible();
  });

  test('shows validation error when submitting empty form', async ({ page }) => {
    await page.getByRole('button', { name: /log in|sign in/i }).click();
    await expect(page.getByText(/required/i)).toBeVisible();
  });
});

test.describe('Dashboard access', () => {
  test.beforeEach(async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('session_token', 'test-token');
    });
    await page.route('**/api/auth/validate', (route) =>
      route.fulfill({ status: 200, json: { valid: true } }),
    );
    await page.route('**/api/status', (route) =>
      route.fulfill({
        status: 200,
        json: {
          isAdminOnboarded: true,
          isServerSetup: true,
          isProjectSetup: false,
          isOnboardingComplete: false,
        },
      }),
    );
    await page.route('**/api/servers', (route) =>
      route.fulfill({ status: 200, json: [] }),
    );
  });

  test('loads dashboard when authenticated', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByText(/dashboard/i)).toBeVisible();
  });
});
