import React, { createContext, useContext, useState, useEffect } from "react";
import { USERS } from "../config/users.js";

const AuthContext = createContext(null);
const SESSION_KEY = "ourstory_session_v1";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
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
    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify({ username: found.username })
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
