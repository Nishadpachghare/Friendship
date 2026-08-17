import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  TIMELINE,
  MEMORIES,
  INSIDE_JOKES,
  FUTURE_MEMORIES,
} from "../data/seedData.js";

const DataContext = createContext(null);
const STORE_KEY = "ourstory_data_v1";
const DB_NAME = "ourstory_db_v1";
const DB_STORE = "kv";
const DB_KEY = "app_state";

function getDefaultStore() {
  return {
    timeline: [...TIMELINE].sort((a, b) => a.date.localeCompare(b.date)),
    memories: MEMORIES,
    jokes: INSIDE_JOKES,
    futureMemories: FUTURE_MEMORIES.map((title, i) => ({
      id: "f" + i,
      title,
      done: false,
    })),
    quizQuestions: [],
    guessPhotoRounds: [],
    unlockedGames: [],
  };
}

function normalizeStore(saved) {
  const savedTimeline = Array.isArray(saved?.timeline) ? saved.timeline : [];

  // Keep only user-added timeline entries and refresh base seeded timeline from latest code.
  const customTimeline = savedTimeline.filter(
    (item) => typeof item?.id === "string" && item.id.startsWith("t_"),
  );

  return {
    timeline: [...TIMELINE, ...customTimeline].sort((a, b) =>
      a.date.localeCompare(b.date),
    ),
    memories: Array.isArray(saved?.memories) ? saved.memories : MEMORIES,
    jokes: Array.isArray(saved?.jokes) ? saved.jokes : INSIDE_JOKES,
    futureMemories: Array.isArray(saved?.futureMemories)
      ? saved.futureMemories
      : FUTURE_MEMORIES.map((title, i) => ({
          id: "f" + i,
          title,
          done: false,
        })),
    unlockedGames: Array.isArray(saved?.unlockedGames)
      ? saved.unlockedGames
      : [],
    quizQuestions: Array.isArray(saved?.quizQuestions)
      ? saved.quizQuestions
      : [],
    guessPhotoRounds: Array.isArray(saved?.guessPhotoRounds)
      ? saved.guessPhotoRounds
      : [],
  };
}

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(DB_STORE)) {
        db.createObjectStore(DB_STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function readDbStore() {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DB_STORE, "readonly");
    const store = tx.objectStore(DB_STORE);
    const request = store.get(DB_KEY);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
    tx.oncomplete = () => db.close();
  });
}

async function writeDbStore(value) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DB_STORE, "readwrite");
    tx.objectStore(DB_STORE).put(value, DB_KEY);
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
}

async function clearDbStore() {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DB_STORE, "readwrite");
    tx.objectStore(DB_STORE).delete(DB_KEY);
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
}

function loadStore() {
  return getDefaultStore();
}

export function DataProvider({ children }) {
  const [store, setStore] = useState(loadStore);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const fromDb = await readDbStore();
        if (fromDb) {
          if (active) setStore(normalizeStore(fromDb));
          return;
        }

        // One-time migration from old localStorage storage.
        const raw = localStorage.getItem(STORE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          const normalized = normalizeStore(parsed);
          if (active) setStore(normalized);
          await writeDbStore(normalized);
        }
      } catch (e) {
        console.error("Could not read saved story data", e);
      } finally {
        if (active) setHydrated(true);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    writeDbStore(store).catch((e) => {
      console.error("Could not persist story data", e);
    });
  }, [store, hydrated]);

  const addMemory = useCallback((memory) => {
    setStore((prev) => ({
      ...prev,
      memories: [{ ...memory, id: "m_" + Date.now() }, ...prev.memories],
    }));
  }, []);

  const deleteMemory = useCallback((memoryId) => {
    setStore((prev) => ({
      ...prev,
      memories: prev.memories.filter((m) => m.id !== memoryId),
    }));
  }, []);

  const addJoke = useCallback((joke) => {
    setStore((prev) => ({
      ...prev,
      jokes: [{ ...joke, id: "j_" + Date.now() }, ...prev.jokes],
    }));
  }, []);

  const addTimelineEvent = useCallback((event) => {
    setStore((prev) => ({
      ...prev,
      timeline: [...prev.timeline, { ...event, id: "t_" + Date.now() }].sort(
        (a, b) => a.date.localeCompare(b.date),
      ),
    }));
  }, []);

  const toggleFuture = useCallback((id) => {
    setStore((prev) => ({
      ...prev,
      futureMemories: prev.futureMemories.map((f) =>
        f.id === id ? { ...f, done: !f.done } : f,
      ),
    }));
  }, []);

  const markGameUnlocked = useCallback((gameId) => {
    setStore((prev) =>
      prev.unlockedGames.includes(gameId)
        ? prev
        : { ...prev, unlockedGames: [...prev.unlockedGames, gameId] },
    );
  }, []);

  const addQuizQuestion = useCallback((question) => {
    setStore((prev) => ({
      ...prev,
      quizQuestions: [
        ...prev.quizQuestions,
        { ...question, id: "q_" + Date.now() },
      ],
    }));
  }, []);

  const updateQuizQuestion = useCallback((questionId, updates) => {
    setStore((prev) => ({
      ...prev,
      quizQuestions: prev.quizQuestions.map((q) =>
        q.id === questionId ? { ...q, ...updates, id: questionId } : q,
      ),
    }));
  }, []);

  const deleteQuizQuestion = useCallback((questionId) => {
    setStore((prev) => ({
      ...prev,
      quizQuestions: prev.quizQuestions.filter((q) => q.id !== questionId),
    }));
  }, []);

  const addGuessPhotoRound = useCallback((round) => {
    setStore((prev) => ({
      ...prev,
      guessPhotoRounds: [
        ...prev.guessPhotoRounds,
        { ...round, id: "g_" + Date.now() },
      ],
    }));
  }, []);

  const updateGuessPhotoRound = useCallback((roundId, updates) => {
    setStore((prev) => ({
      ...prev,
      guessPhotoRounds: prev.guessPhotoRounds.map((r) =>
        r.id === roundId ? { ...r, ...updates, id: roundId } : r,
      ),
    }));
  }, []);

  const deleteGuessPhotoRound = useCallback((roundId) => {
    setStore((prev) => ({
      ...prev,
      guessPhotoRounds: prev.guessPhotoRounds.filter((r) => r.id !== roundId),
    }));
  }, []);

  const resetStore = useCallback(() => {
    localStorage.removeItem(STORE_KEY);
    clearDbStore().catch((e) => {
      console.error("Could not clear saved story data", e);
    });
    setStore(loadStore());
  }, []);

  return (
    <DataContext.Provider
      value={{
        ...store,
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
