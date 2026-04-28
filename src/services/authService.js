// src/services/authService.js
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const authService = {
  async register(userData) {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // important for cookies
      body: JSON.stringify(userData),
    });
    if (!res.ok) throw await res.json();
    return res.json();
  },

  async login(phoneNumber, password) {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ phoneNumber, password }),
    });
    if (!res.ok) throw await res.json();
    return res.json();
  },

  async logout() {
    const res = await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    if (!res.ok) throw await res.json();
    return res.json();
  },

  async getCurrentUser() {
    const res = await fetch(`${API_URL}/auth/me`, {
      credentials: 'include',
    });
    if (!res.ok) throw await res.json();
    return res.json();
  },
};