import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  apiFetch,
  fetchCsrfCookie,
  setToken,
  clearToken,
} from "../api/client";

const AuthContext = createContext(null);

const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkSession = useCallback(async () => {
    try {
      const loginTime = localStorage.getItem("auth_login_time");

      // No login timestamp means there is no valid frontend session
      if (!loginTime) {
        clearToken();
        setUser(null);
        return;
      }

      const elapsed = Date.now() - Number(loginTime);

      // Session expired after 24 hours
      if (elapsed >= SESSION_DURATION) {
        clearToken();
        localStorage.removeItem("auth_login_time");
        setUser(null);
        return;
      }

      const res = await apiFetch("/user/me");

      setUser(res.data ?? res);
    } catch {
      clearToken();
      localStorage.removeItem("auth_login_time");
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

      // Start 24-hour session
      localStorage.setItem(
        "auth_login_time",
        Date.now().toString(),
      );

      setUser(data.user);
    }

    return data;
  }, []);

  const register = useCallback(
    async ({
      name,
      email,
      password,
      password_confirmation,
    }) => {
      await fetchCsrfCookie();

      return apiFetch("/register", {
        method: "POST",
        body: JSON.stringify({
          name,
          email,
          password,
          password_confirmation,
        }),
      });
    },
    [],
  );

  const loginWithToken = useCallback(async (token) => {
    setToken(token);

    // Start 24-hour session for Google/GitHub login
    localStorage.setItem(
      "auth_login_time",
      Date.now().toString(),
    );

    try {
      const res = await apiFetch("/user/me");

      const currentUser = res.data ?? res;

      setUser(currentUser);

      return currentUser;
    } catch (err) {
      clearToken();
      localStorage.removeItem("auth_login_time");
      setUser(null);

      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiFetch("/logout", {
        method: "POST",
      });
    } finally {
      clearToken();
      localStorage.removeItem("auth_login_time");
      setUser(null);
    }
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

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error(
      "useAuth must be used within an AuthProvider",
    );
  }

  return ctx;
}