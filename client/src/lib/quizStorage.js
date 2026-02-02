const isBrowser = typeof window !== "undefined";

const STORAGE_KEYS = {
  settings: "xdquiz_settings",
  results: "xdquiz_results",
  leaderboard: "xdquiz_leaderboard",
};

function getStoredJson(key, fallback) {
  if (!isBrowser) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (error) {
    return fallback;
  }
}

function setStoredJson(key, value) {
  if (!isBrowser) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    // ignore storage errors
  }
}

export function saveQuizSettings(settings) {
  setStoredJson(STORAGE_KEYS.settings, settings);
}

export function getQuizSettings() {
  return getStoredJson(STORAGE_KEYS.settings, null);
}

export function saveQuizResults(results) {
  setStoredJson(STORAGE_KEYS.results, results);
}

export function getQuizResults() {
  return getStoredJson(STORAGE_KEYS.results, null);
}

export function getLeaderboard() {
  return getStoredJson(STORAGE_KEYS.leaderboard, []);
}

export function saveLeaderboardEntry(entry) {
  const current = getLeaderboard();
  const updated = [entry, ...current]
    .filter(Boolean)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    })
    .slice(0, 20);

  setStoredJson(STORAGE_KEYS.leaderboard, updated);
  return updated;
}
