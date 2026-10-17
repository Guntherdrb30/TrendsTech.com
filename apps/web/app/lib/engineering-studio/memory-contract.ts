export type MobileMemoryKind = 'CONVERSATION_SUMMARY' | 'DECISION' | 'NOTE';

export function validateMobileMemory(input: { type: string; title: string; content: string }) {
  const kind = input.type;
  if (kind !== 'CONVERSATION_SUMMARY' && kind !== 'DECISION' && kind !== 'NOTE') {
    throw new Error('Tipo de memoria no permitido.');
  }
  const title = input.title.trim();
  const content = input.content.trim();
  if (title.length < 3 || title.length > 160) throw new Error('El titulo debe tener entre 3 y 160 caracteres.');
  if (content.length < 10 || content.length > 12000) throw new Error('La memoria debe tener entre 10 y 12000 caracteres.');
  return { type: kind as MobileMemoryKind, title, content };
}

export function normalizedGitHubRepo(value: string | null | undefined) {
  if (!value) return null;
  const stripped = value.trim().replace(/\\.git$/i, '');
  const fullName = stripped.replace(/^https:\/\/github\\.com\//i, '').replace(/^git@github\\.com:/i, '');
  return /^[a-z0-9_.-]+\/[a-z0-9_.-]+$/i.test(fullName) ? fullName : null;
}

export function isRecentGitHubCommit(timestamp: string | null, nowMs = Date.now()) {
  if (!timestamp) return false;
  const commitTime = Date.parse(timestamp);
  return Number.isFinite(commitTime) && commitTime <= nowMs + 5 * 60_000 && commitTime >= nowMs - 24 * 60 * 60_000;
}
