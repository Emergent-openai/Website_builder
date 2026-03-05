const AUTH_SESSION_KEY = "creative-studio-auth-session";


export const getStoredSession = () => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const rawValue = window.localStorage.getItem(AUTH_SESSION_KEY);
    return rawValue ? JSON.parse(rawValue) : null;
  } catch (error) {
    console.error("Could not read auth session", error);
    return null;
  }
};


export const getStoredToken = () => getStoredSession()?.access_token || null;


export const setStoredSession = (session) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
};


export const clearStoredSession = () => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(AUTH_SESSION_KEY);
};