import React, { createContext, useContext, useState, useEffect } from "react";
import { USERS } from "../config/users.js";

const AuthContext = createContext(null);
const SESSION_KEY = "ourstory_session_v1";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      // Clear old legacy localStorage session to enforce fresh login page on new session
      localStorage.removeItem(SESSION_KEY);
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        const savedUsername = typeof saved?.username === "string" ? saved.username : "";
        return USERS.find((u) => u.username === savedUsername) || null;
      }
    } catch (e) {
      console.error("Could not restore session", e);
    }
    return null;
  });
  const [ready, setReady] = useState(true);

  function login(username, password) {
    const cleanUser = (username || "").trim().toLowerCase();
    const cleanPass = (password || "").trim();

    const found = USERS.find(
      (u) =>
        (u.username.toLowerCase() === cleanUser || u.displayName.toLowerCase() === cleanUser) &&
        u.password === cleanPass
    );

    if (!found) {
      return { ok: false, error: "Incorrect username or password. Please try again." };
    }

    setUser(found);
    const sessionData = JSON.stringify({ username: found.username });
    sessionStorage.setItem(SESSION_KEY, sessionData);
    localStorage.removeItem(SESSION_KEY);
    return { ok: true };
  }

  function logout() {
    setUser(null);
    sessionStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(SESSION_KEY);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, ready }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
