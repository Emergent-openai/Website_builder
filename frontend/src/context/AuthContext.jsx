import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { authApi } from "@/lib/api";
import { clearStoredSession, getStoredSession, setStoredSession } from "@/lib/auth";


const AuthContext = createContext(null);


export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const persistSession = useCallback((payload) => {
    setStoredSession(payload);
    setUser(payload.user);
    setToken(payload.access_token);
  }, []);

  const clearSession = useCallback(() => {
    clearStoredSession();
    setUser(null);
    setToken(null);
  }, []);

  useEffect(() => {
    const restoreSession = async () => {
      const storedSession = getStoredSession();

      if (!storedSession?.access_token) {
        setIsLoading(false);
        return;
      }

      setToken(storedSession.access_token);

      try {
        const currentUser = await authApi.me();
        persistSession({
          access_token: storedSession.access_token,
          token_type: "bearer",
          user: currentUser,
        });
      } catch (error) {
        console.error(error);
        clearSession();
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, [clearSession, persistSession]);

  const login = useCallback(async (payload) => {
    const session = await authApi.login(payload);
    persistSession(session);
    return session;
  }, [persistSession]);

  const signup = useCallback(async (payload) => {
    const session = await authApi.signup(payload);
    persistSession(session);
    return session;
  }, [persistSession]);

  const logout = useCallback(() => {
    clearSession();
  }, [clearSession]);

  const value = useMemo(() => ({
    user,
    token,
    isLoading,
    isAuthenticated: Boolean(user && token),
    login,
    signup,
    logout,
  }), [user, token, isLoading, login, signup, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};


export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};