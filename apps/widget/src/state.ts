const SESSION_KEY_PREFIX = 'trends172tech_widget_session';

function safeStorage() {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function generateSessionId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `sess_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function getSessionKey(installId: string) {
  return `${SESSION_KEY_PREFIX}_${installId}`;
}

export function getOrCreateSessionId(installId: string) {
  const storage = safeStorage();
  const key = getSessionKey(installId);

  if (storage) {
    const existing = storage.getItem(key);
    if (existing) {
      return existing;
    }
  }

  const created = generateSessionId();
  storage?.setItem(key, created);
  return created;
}

export function resetSessionId(installId: string) {
  const storage = safeStorage();
  const key = getSessionKey(installId);
  storage?.removeItem(key);
  return getOrCreateSessionId(installId);
}
