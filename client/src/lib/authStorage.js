const isBrowser = typeof window !== "undefined";

const STORAGE_KEYS = {
  users: "xdquiz_users",
  currentUser: "xdquiz_current_user",
};

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

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

function simpleHash(input) {
  let hash = 0;
  const value = String(input || "");
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(16);
}

async function hashPassword(password) {
  const value = String(password || "");
  if (!isBrowser || !window.crypto?.subtle) {
    return simpleHash(value);
  }
  const encoder = new TextEncoder();
  const data = encoder.encode(value);
  const digest = await window.crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(digest));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function getCurrentUser() {
  return getStoredJson(STORAGE_KEYS.currentUser, null);
}

export function logoutUser() {
  if (!isBrowser) return;
  window.localStorage.removeItem(STORAGE_KEYS.currentUser);
}

export async function registerUser({ email, password, acceptTerms, nickname }) {
  const normalized = normalizeEmail(email);
  const users = getStoredJson(STORAGE_KEYS.users, []);
  const safeNickname = String(nickname || "").trim();

  if (!acceptTerms) {
    return { ok: false, error: "Aceite os termos e politicas para continuar." };
  }

  if (!safeNickname) {
    return { ok: false, error: "Informe um apelido para o ranking." };
  }

  if (safeNickname.length > 15) {
    return { ok: false, error: "O apelido deve ter 15 caracteres ou menos." };
  }

  if (!normalized) {
    return { ok: false, error: "Informe um email valido." };
  }

  const exists = users.some((user) => normalizeEmail(user.email) === normalized);
  if (exists) {
    return { ok: false, error: "Esse email ja esta cadastrado." };
  }

  const passwordHash = await hashPassword(password);
  const now = new Date().toISOString();
  const newUser = {
    id: `user_${Date.now()}`,
    email: normalized,
    nickname: safeNickname,
    passwordHash,
    acceptedTermsAt: now,
    createdAt: now,
  };

  const updated = [...users, newUser];
  setStoredJson(STORAGE_KEYS.users, updated);
  setStoredJson(STORAGE_KEYS.currentUser, {
    id: newUser.id,
    email: newUser.email,
    nickname: newUser.nickname,
    acceptedTermsAt: newUser.acceptedTermsAt,
  });

  return { ok: true, user: newUser };
}

export async function loginUser({ email, password }) {
  const normalized = normalizeEmail(email);
  const users = getStoredJson(STORAGE_KEYS.users, []);
  const user = users.find((u) => normalizeEmail(u.email) === normalized);

  if (!user) {
    return { ok: false, error: "Email nao encontrado." };
  }

  const passwordHash = await hashPassword(password);
  if (passwordHash !== user.passwordHash) {
    return { ok: false, error: "Senha incorreta." };
  }

  setStoredJson(STORAGE_KEYS.currentUser, {
    id: user.id,
    email: user.email,
    nickname: user.nickname,
    acceptedTermsAt: user.acceptedTermsAt,
  });

  return { ok: true, user };
}
