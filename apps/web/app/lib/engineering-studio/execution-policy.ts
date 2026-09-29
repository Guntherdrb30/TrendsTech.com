export const MAX_STUDIO_FILE_BYTES = 500_000;

const BLOCKED_EXACT = new Set([
  '.env',
  '.env.local',
  '.env.production',
  '.env.preview',
  '.env.development',
  '.npmrc',
  '.pypirc',
  'credentials.json',
  'service-account.json'
]);

const BLOCKED_PREFIXES = [
  '.git/',
  '.vercel/',
  'node_modules/',
  '.github/workflows/'
];

const BLOCKED_EXTENSIONS = ['.pem', '.key', '.p12', '.pfx', '.jks'];

export function normalizeGitHubRepository(value: string) {
  const trimmed = value.trim().replace(/\.git$/i, '');
  if (trimmed.startsWith('https://github.com/')) {
    return trimmed.slice('https://github.com/'.length);
  }
  if (trimmed.startsWith('git@github.com:')) {
    return trimmed.slice('git@github.com:'.length);
  }
  return trimmed;
}

export function assertStudioWorkBranch(branch: string) {
  const normalized = branch.trim();
  if (!normalized.startsWith('studio/')) {
    throw new Error('Engineering Studio solo puede modificar ramas de trabajo studio/...');
  }
  if (normalized.includes('..') || !/^studio\/[A-Za-z0-9._/-]{3,220}$/.test(normalized)) {
    throw new Error('Rama de trabajo inválida.');
  }
  return normalized;
}

export function normalizeStudioRepoPath(input: string) {
  const value = input.trim().replace(/\\/g, '/').replace(/^\.\//, '');
  if (!value || value.startsWith('/') || value.includes('\0')) {
    throw new Error('Ruta de repositorio inválida.');
  }

  const parts = value.split('/');
  if (parts.some((part) => !part || part === '.' || part === '..')) {
    throw new Error('La ruta no puede contener segmentos vacíos, . o ...');
  }

  const lower = value.toLowerCase();
  const basename = parts[parts.length - 1].toLowerCase();
  if (BLOCKED_EXACT.has(basename)) {
    throw new Error('Engineering Studio no puede leer ni modificar archivos de secretos.');
  }
  if (BLOCKED_PREFIXES.some((prefix) => lower.startsWith(prefix))) {
    throw new Error('Ruta protegida para Engineering Studio.');
  }
  if (BLOCKED_EXTENSIONS.some((extension) => basename.endsWith(extension))) {
    throw new Error('Engineering Studio no puede leer ni modificar archivos de credenciales.');
  }

  if (basename.startsWith('.env.') && !['.env.example', '.env.sample', '.env.template'].includes(basename)) {
    throw new Error('Engineering Studio no puede leer ni modificar archivos de entorno con valores reales.');
  }

  return value;
}

export function isVisibleStudioRepoPath(input: string) {
  try {
    normalizeStudioRepoPath(input);
    return true;
  } catch {
    return false;
  }
}
