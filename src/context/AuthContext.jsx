import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { apiFetch, fetchCsrfCookie, setToken, clearToken } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const checkSession = useCallback(async () => {
    try {
      const res = await apiFetch("/user/me");
      setUser(res.data ?? res); // unwrap { status, data } envelope
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const login = useCallback(async ({ email, password }) => {
    await fetchCsrfCookie();
    const data = await apiFetch("/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (data.access_token) {
      setToken(data.access_token);
      setUser(data.user);
    }
    return data;
  }, []);

  const register = useCallback(
    async ({ name, email, password, password_confirmation }) => {
      await fetchCsrfCookie();
      return apiFetch("/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password, password_confirmation }),
      });
    },
    [],
  );

  // Used by the OAuth callback route: we already have an access_token
  // from the URL query param (issued by Laravel after Google/GitHub auth),
  // so just store it and fetch the user the same way checkSession() does.
  const loginWithToken = useCallback(async (token) => {
    setToken(token);
    try {
      const res = await apiFetch("/user/me");
      const currentUser = res.data ?? res;
      setUser(currentUser);
      return currentUser;
    } catch (err) {
      clearToken();
      setUser(null);
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    await apiFetch("/logout", { method: "POST" });
    clearToken();
    setUser(null);
  }, []);

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    loginWithToken,
    checkSession,
    isAuthenticated: Boolean(user),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}