export const CHUNK_MIN_TOKENS = 300;
export const CHUNK_MAX_TOKENS = 700;
export const CONTEXT_MAX_TOKENS = 1200;
export const EMBEDDING_MODEL = process.env.OPENAI_EMBEDDING_MODEL ?? 'text-embedding-3-small';
export const EMBEDDING_DIMENSION = Number(process.env.OPENAI_EMBEDDING_DIMENSION ?? 1536);
export const URL_PAGE_LIMIT_DEFAULT = 5;
export const URL_PAGE_LIMIT_HARD = 25;
