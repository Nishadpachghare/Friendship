import React, { createContext, useContext, useState, useEffect } from "react";
import { USERS } from "../config/users.js";

const AuthContext = createContext(null);
const SESSION_KEY = "ourstory_session_v1";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        const savedUsername =
          typeof saved?.username === "string" ? saved.username : "";
        const found = USERS.find((u) => u.username === savedUsername);
        if (found) setUser(found);
      }
    } catch (e) {
      console.error("Could not restore session", e);
    }
    setReady(true);
  }, []);

  function login(username, password) {
    const clean = username.trim().toLowerCase();
    const found = USERS.find(
      (u) => u.username === clean && u.password === password,
    );
    if (!found)
      return { ok: false, error: "Those details don\u2019t match. Try again." };
    setUser(found);
    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({ username: found.username }),
    );
    return { ok: true };
  }

  function logout() {
    setUser(null);
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
