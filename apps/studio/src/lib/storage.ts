// Guarded localStorage helpers for Studio. All project state lives in the
// browser under a single namespaced key; access is defensive so SSR / private
// mode / quota errors never crash the app.

const NS = "drx-studio";
export const PROJECTS_KEY = `${NS}:projects`;
export const ACTIVE_PROJECT_ID_KEY = `${NS}:activeProjectId`;

function getStore(): Storage | null {
  try {
    if (typeof window === "undefined" || !window.localStorage) return null;
    return window.localStorage;
  } catch {
    // Access to localStorage can throw (e.g. blocked cookies / sandboxed iframe).
    return null;
  }
}

export function readJson<T>(key: string): T | null {
  const store = getStore();
  if (!store) return null;
  try {
    const raw = store.getItem(key);
    if (raw === null) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function writeJson(key: string, value: unknown): void {
  const store = getStore();
  if (!store) return;
  try {
    store.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore quota / serialization errors — persistence is best-effort.
  }
}

export function readString(key: string): string | null {
  const store = getStore();
  if (!store) return null;
  try {
    return store.getItem(key);
  } catch {
    return null;
  }
}

export function writeString(key: string, value: string): void {
  const store = getStore();
  if (!store) return;
  try {
    store.setItem(key, value);
  } catch {
    // Ignore.
  }
}

/** Best-effort unique id, with a fallback for environments lacking crypto.randomUUID. */
export function newId(): string {
  try {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      return crypto.randomUUID();
    }
  } catch {
    // fall through
  }
  return `p_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}
