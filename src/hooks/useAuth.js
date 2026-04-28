// src/hooks/useAuth.js
import { useState, useEffect } from "react";
import { authService } from "@/services/authService";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is already logged in (on mount)
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const userData = await authService.getCurrentUser();
      setUser(userData);
    } catch (err) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (phoneNumber, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const { user: userData } = await authService.login(phoneNumber, password);
      setUser(userData);
      return userData;
    } catch (err) {
      setError(err.message || "Login failed");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    setIsLoading(true);
    setError(null);
    try {
      const { user: newUser } = await authService.register(userData);
      setUser(newUser);
      return newUser;
    } catch (err) {
      setError(err.message || "Registration failed");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
    } catch (err) {
      console.error("Logout error", err);
    }
  };

  return { user, isLoading, error, register, login, logout, checkAuth };
}
