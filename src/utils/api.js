/**
 * Thin API wrapper for the Express/MongoDB backend.
 * All game data (quiz questions, guess-photo rounds) is fetched from here.
 */

const getApiBase = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host !== 'localhost' && host !== '127.0.0.1') {
      return '/api';
    }
  }
  return 'http://localhost:3001/api';
};

const BASE = getApiBase();

async function request(method, path, body) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body !== undefined) opts.body = JSON.stringify(body);

  const res = await fetch(`${BASE}${path}`, opts);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

// ── Quiz Questions ────────────────────────────────────────────────────────────
export const quizApi = {
  getAll:  ()           => request('GET',    '/quiz'),
  create:  (data)       => request('POST',   '/quiz', data),
  update:  (id, data)   => request('PUT',    `/quiz/${id}`, data),
  remove:  (id)         => request('DELETE', `/quiz/${id}`),
};

// ── Guess Photo Rounds ────────────────────────────────────────────────────────
export const guessPhotoApi = {
  getAll:  ()           => request('GET',    '/guess-photo'),
  create:  (data)       => request('POST',   '/guess-photo', data),
  update:  (id, data)   => request('PUT',    `/guess-photo/${id}`, data),
  remove:  (id)         => request('DELETE', `/guess-photo/${id}`),
};

// ── Game Scores ───────────────────────────────────────────────────────────────
export const scoresApi = {
  getAll:  ()           => request('GET',    '/scores'),
  create:  (data)       => request('POST',   '/scores', data),
};

// ── Timeline Events ───────────────────────────────────────────────────────────
export const timelineApi = {
  getAll:  ()           => request('GET',    '/timeline'),
  create:  (data)       => request('POST',   '/timeline', data),
  update:  (id, data)   => request('PUT',    `/timeline/${id}`, data),
  remove:  (id)         => request('DELETE', `/timeline/${id}`),
};

/** Returns true if the backend server is reachable */
export async function isServerReachable() {
  try {
    const res = await fetch(`${BASE}/health`, { signal: AbortSignal.timeout(2000) });
    return res.ok;
  } catch {
    return false;
  }
}
