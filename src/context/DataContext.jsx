import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import {
  TIMELINE,
  MEMORIES,
  INSIDE_JOKES,
  FUTURE_MEMORIES,
} from "../data/seedData.js";
import { quizApi, guessPhotoApi, scoresApi, timelineApi, memoriesApi, isServerReachable } from "../utils/api.js";

const DataContext = createContext(null);
const STORE_KEY = "ourstory_data_v1";
const DB_NAME = "ourstory_db_v1";
const DB_STORE = "kv";
const DB_KEY = "app_state";

// ─── Local IndexedDB helpers (for non-game data) ──────────────────────────────
function getDefaultStore() {
  return {
    timeline: [...TIMELINE].sort((a, b) => a.date.localeCompare(b.date)),
    memories: MEMORIES,
    jokes: INSIDE_JOKES,
    futureMemories: FUTURE_MEMORIES.map((title, i) => ({ id: "f" + i, title, done: false })),
    unlockedGames: [],
  };
}

function normalizeStore(saved) {
  const savedTimeline = Array.isArray(saved?.timeline) ? saved.timeline : [];
  const customTimeline = savedTimeline.filter(
    (item) => typeof item?.id === "string" && item.id.startsWith("t_"),
  );
  const rawMemories = Array.isArray(saved?.memories) ? saved.memories : MEMORIES;
  const cleanMemories = rawMemories.filter(
    (m) => !m?.caption || !m.caption.toLowerCase().includes("oiykjn")
  );

  return {
    timeline: [...TIMELINE, ...customTimeline].sort((a, b) => a.date.localeCompare(b.date)),
    memories: cleanMemories,
    jokes: Array.isArray(saved?.jokes) ? saved.jokes : INSIDE_JOKES,
    futureMemories: Array.isArray(saved?.futureMemories)
      ? saved.futureMemories
      : FUTURE_MEMORIES.map((title, i) => ({ id: "f" + i, title, done: false })),
    unlockedGames: Array.isArray(saved?.unlockedGames) ? saved.unlockedGames : [],
  };
}

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(DB_STORE)) db.createObjectStore(DB_STORE);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function readDbStore() {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DB_STORE, "readonly");
    const req = tx.objectStore(DB_STORE).get(DB_KEY);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
    tx.oncomplete = () => db.close();
  });
}

async function writeDbStore(value) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DB_STORE, "readwrite");
    tx.objectStore(DB_STORE).put(value, DB_KEY);
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
}

async function clearDbStore() {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DB_STORE, "readwrite");
    tx.objectStore(DB_STORE).delete(DB_KEY);
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function DataProvider({ children }) {
  const [store, setStore] = useState(getDefaultStore);
  const [hydrated, setHydrated] = useState(false);

  // ── Game, Timeline & Memories data from MongoDB ──────────────────────────────
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [guessPhotoRounds, setGuessPhotoRounds] = useState([]);
  const [gameScores, setGameScores] = useState([]);
  const [mongoTimeline, setMongoTimeline] = useState([]);
  const [mongoMemories, setMongoMemories] = useState([]);
  const [serverOnline, setServerOnline] = useState(true);
  const [gameDataLoading, setGameDataLoading] = useState(true);

  // ── Hydrate local store (IndexedDB) ────────────────────────────────────────
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const fromDb = await readDbStore();
        if (fromDb && active) { setStore(normalizeStore(fromDb)); return; }

        const raw = localStorage.getItem(STORE_KEY);
        if (raw) {
          const normalized = normalizeStore(JSON.parse(raw));
          if (active) setStore(normalized);
          await writeDbStore(normalized);
        }
      } catch (e) {
        console.error("Could not read saved story data", e);
      } finally {
        if (active) setHydrated(true);
      }
    })();
    return () => { active = false; };
  }, []);

  // Persist local store changes
  useEffect(() => {
    if (!hydrated) return;
    writeDbStore(store).catch((e) => console.error("Could not persist story data", e));
  }, [store, hydrated]);

  // ── Fetch game data, timeline & memories from MongoDB ──────────────────────
  useEffect(() => {
    let active = true;
    (async () => {
      setGameDataLoading(true);
      const online = await isServerReachable();
      if (!active) return;

      if (!online) {
        console.warn("[API] Backend server not reachable — MongoDB data unavailable.");
        setServerOnline(false);
        setGameDataLoading(false);
        return;
      }

      setServerOnline(true);
      try {
        const [quiz, guessPhoto, scores, timelineEvents, memoriesData] = await Promise.all([
          quizApi.getAll(),
          guessPhotoApi.getAll(),
          scoresApi.getAll(),
          timelineApi.getAll(),
          memoriesApi.getAll(),
        ]);
        if (active) {
          setQuizQuestions(quiz);
          setGuessPhotoRounds(guessPhoto);
          setGameScores(scores);
          setMongoTimeline(timelineEvents);
          setMongoMemories(memoriesData);
        }
      } catch (e) {
        console.error("Could not load MongoDB data:", e);
      } finally {
        if (active) setGameDataLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  // ─── Actions ────────────────────────────────────────────────────────────────
  const addMemory = useCallback(async (memory) => {
    const tempId = "m_" + Date.now();
    const newMem = { ...memory, id: tempId };

    setStore((prev) => ({ ...prev, memories: [newMem, ...prev.memories] }));
    try {
      const created = await memoriesApi.create(memory);
      if (created) {
        setMongoMemories((prev) => [created, ...prev.filter((m) => m.id !== tempId && m.id !== created.id)]);
      }
    } catch (e) {
      console.error("addMemory MongoDB error:", e);
    }
  }, []);

  const deleteMemory = useCallback(async (memoryId) => {
    setStore((prev) => ({ ...prev, memories: prev.memories.filter((m) => m.id !== memoryId) }));
    setMongoMemories((prev) => prev.filter((m) => m.id !== memoryId));
    try {
      await memoriesApi.remove(memoryId);
    } catch (e) {
      console.error("deleteMemory MongoDB error:", e);
    }
  }, []);

  const addJoke = useCallback((joke) => {
    setStore((prev) => ({ ...prev, jokes: [{ ...joke, id: "j_" + Date.now() }, ...prev.jokes] }));
  }, []);

  const addTimelineEvent = useCallback(async (event) => {
    const tempId = "t_" + Date.now();
    const newEvt = { ...event, id: tempId };

    setStore((prev) => ({
      ...prev,
      timeline: [...prev.timeline, newEvt].sort((a, b) => a.date.localeCompare(b.date)),
    }));

    try {
      const created = await timelineApi.create(event);
      if (created) {
        setMongoTimeline((prev) =>
          [...prev.filter((t) => t.id !== tempId && t.id !== created.id), created].sort((a, b) =>
            a.date.localeCompare(b.date),
          ),
        );
      }
    } catch (e) {
      console.error("addTimelineEvent MongoDB error:", e);
    }
  }, []);

  const toggleFuture = useCallback((id) => {
    setStore((prev) => ({
      ...prev,
      futureMemories: prev.futureMemories.map((f) => f.id === id ? { ...f, done: !f.done } : f),
    }));
  }, []);

  const markGameUnlocked = useCallback((gameId) => {
    setStore((prev) =>
      prev.unlockedGames.includes(gameId)
        ? prev
        : { ...prev, unlockedGames: [...prev.unlockedGames, gameId] },
    );
  }, []);

  // ─── Quiz CRUD → MongoDB ────────────────────────────────────────────────────
  const addQuizQuestion = useCallback(async (questionData) => {
    try {
      const created = await quizApi.create(questionData);
      setQuizQuestions((prev) => [...prev, created]);
      return created;
    } catch (e) {
      console.error("addQuizQuestion failed:", e);
      throw e;
    }
  }, []);

  const updateQuizQuestion = useCallback(async (questionId, updates) => {
    try {
      const updated = await quizApi.update(questionId, updates);
      setQuizQuestions((prev) => prev.map((q) => q.id === questionId ? updated : q));
    } catch (e) {
      console.error("updateQuizQuestion failed:", e);
      throw e;
    }
  }, []);

  const deleteQuizQuestion = useCallback(async (questionId) => {
    try {
      await quizApi.remove(questionId);
      setQuizQuestions((prev) => prev.filter((q) => q.id !== questionId));
    } catch (e) {
      console.error("deleteQuizQuestion failed:", e);
      throw e;
    }
  }, []);

  // ─── Guess Photo CRUD → MongoDB ─────────────────────────────────────────────
  const addGuessPhotoRound = useCallback(async (roundData) => {
    try {
      const created = await guessPhotoApi.create(roundData);
      setGuessPhotoRounds((prev) => [...prev, created]);
      return created;
    } catch (e) {
      console.error("addGuessPhotoRound failed:", e);
      throw e;
    }
  }, []);

  const updateGuessPhotoRound = useCallback(async (roundId, updates) => {
    try {
      const updated = await guessPhotoApi.update(roundId, updates);
      setGuessPhotoRounds((prev) => prev.map((r) => r.id === roundId ? updated : r));
    } catch (e) {
      console.error("updateGuessPhotoRound failed:", e);
      throw e;
    }
  }, []);

  const deleteGuessPhotoRound = useCallback(async (roundId) => {
    try {
      await guessPhotoApi.remove(roundId);
      setGuessPhotoRounds((prev) => prev.filter((r) => r.id !== roundId));
    } catch (e) {
      console.error("deleteGuessPhotoRound failed:", e);
      throw e;
    }
  }, []);

  const saveGameScore = useCallback(async (scoreData) => {
    try {
      const created = await scoresApi.create(scoreData);
      setGameScores((prev) => [created, ...prev]);
      return created;
    } catch (e) {
      console.error("saveGameScore failed:", e);
    }
  }, []);

  const resetStore = useCallback(() => {
    localStorage.removeItem(STORE_KEY);
    clearDbStore().catch((e) => console.error("Could not clear saved story data", e));
    setStore(getDefaultStore());
  }, []);

  const effectiveTimeline = useMemo(() => {
    if (mongoTimeline.length === 0) return store.timeline;
    const mongoIds = new Set(mongoTimeline.map((t) => t.id || t._id));
    const localOnly = store.timeline.filter((t) => t && t.id && !mongoIds.has(t.id));
    return [...mongoTimeline, ...localOnly].sort((a, b) => a.date.localeCompare(b.date));
  }, [mongoTimeline, store.timeline]);

  const effectiveMemories = useMemo(() => {
    if (mongoMemories.length === 0) return store.memories;
    const mongoIds = new Set(mongoMemories.map((m) => m.id || m._id));
    const localOnly = store.memories.filter((m) => m && m.id && !mongoIds.has(m.id));
    return [...mongoMemories, ...localOnly];
  }, [mongoMemories, store.memories]);

  return (
    <DataContext.Provider
      value={{
        ...store,
        timeline: effectiveTimeline,
        memories: effectiveMemories,
        mongoMemories,
        // MongoDB-backed game data, timeline & scores
        quizQuestions,
        guessPhotoRounds,
        gameScores,
        mongoTimeline,
        serverOnline,
        gameDataLoading,
        saveGameScore,
        // Actions
        addMemory,
        deleteMemory,
        addJoke,
        addTimelineEvent,
        toggleFuture,
        markGameUnlocked,
        addQuizQuestion,
        updateQuizQuestion,
        deleteQuizQuestion,
        addGuessPhotoRound,
        updateGuessPhotoRound,
        deleteGuessPhotoRound,
        resetStore,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used inside DataProvider");
  return ctx;
}
