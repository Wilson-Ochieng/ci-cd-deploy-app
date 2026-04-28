import { test, expect } from '@playwright/test';


test.describe('Authentication', () => {
  const baseURL = 'http://localhost:3000';
  const apiURL = 'http://localhost:5000/api';

  test('user can register and login', async ({ request }) => {
    const uniquePhone = `07${Date.now().toString().slice(-8)}`;
    const registerRes = await request.post(`${apiURL}/auth/register`, {
      data: {
        phoneNumber: uniquePhone,
        fullName: 'Playwright Tester',
        password: 'test123',
        role: 'shipper',
      },
    });
    expect(registerRes.status()).toBe(201);
    const { user } = await registerRes.json();
    expect(user.role).toBe('shipper');

    // Login with the same credentials
    const loginRes = await request.post(`${apiURL}/auth/login`, {
      data: { phoneNumber: uniquePhone, password: 'test123' },
    });
    expect(loginRes.status()).toBe(200);
    const cookies = loginRes.headers()['set-cookie'];
    expect(cookies).toBeDefined();
  });

  test('admin can access admin panel', async ({ page, request }) => {
    // Login as admin
    const loginRes = await request.post(`${apiURL}/auth/login`, {
      data: { phoneNumber: '0700000000', password: 'admin123' },
    });
    const cookie = loginRes.headers()['set-cookie'];
    await page.context().addCookies([{ name: 'token', value: cookie.split(';')[0].split('=')[1], url: baseURL }]);
    await page.goto(`${baseURL}/admin`);
    await expect(page.locator('text=Admin Panel')).toBeVisible();
    await expect(page.locator('text=Total Users')).toBeVisible();
  });
});