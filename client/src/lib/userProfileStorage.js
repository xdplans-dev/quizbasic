const isBrowser = typeof window !== "undefined";

const STORAGE_KEYS = {
  profiles: "xdquiz_user_profiles",
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

export function getUserProfile(userId) {
  if (!userId) return null;
  const profiles = getStoredJson(STORAGE_KEYS.profiles, {});
  return profiles[userId] || null;
}

export function saveUserProfile(userId, profile) {
  if (!userId) return null;
  const profiles = getStoredJson(STORAGE_KEYS.profiles, {});
  const nextProfile = {
    ...profiles[userId],
    ...profile,
    updatedAt: new Date().toISOString(),
  };
  setStoredJson(STORAGE_KEYS.profiles, {
    ...profiles,
    [userId]: nextProfile,
  });
  return nextProfile;
}
