import { CHUNK_MAX_TOKENS, CHUNK_MIN_TOKENS } from './config';
import { estimateTokens, splitParagraphs, splitSentences, normalizeText } from './text';

export type ChunkMeta = {
  source: string;
  title?: string;
  section?: string;
  url?: string;
  language?: string;
};

export type TextChunk = {
  content: string;
  tokenCount: number;
  meta: ChunkMeta;
};

function pushChunk(chunks: TextChunk[], content: string, meta: ChunkMeta) {
  const normalized = normalizeText(content);
  if (!normalized) {
    return;
  }
  chunks.push({
    content: normalized,
    tokenCount: estimateTokens(normalized),
    meta
  });
}

export function chunkText(text: string, meta: ChunkMeta): TextChunk[] {
  const normalized = normalizeText(text);
  if (!normalized) {
    return [];
  }

  const paragraphs = splitParagraphs(normalized);
  const chunks: TextChunk[] = [];
  let current = '';
  let currentTokens = 0;

  const flush = () => {
    if (current.trim()) {
      pushChunk(chunks, current, meta);
    }
    current = '';
    currentTokens = 0;
  };

  const addUnit = (unit: string) => {
    const unitTokens = estimateTokens(unit);
    if (currentTokens + unitTokens > CHUNK_MAX_TOKENS && currentTokens >= CHUNK_MIN_TOKENS) {
      flush();
    }
    current = current ? `${current}\n\n${unit}` : unit;
    currentTokens += unitTokens;
  };

  for (const paragraph of paragraphs) {
    const paragraphTokens = estimateTokens(paragraph);
    if (paragraphTokens > CHUNK_MAX_TOKENS) {
      const sentences = splitSentences(paragraph);
      for (const sentence of sentences) {
        addUnit(sentence);
      }
      continue;
    }
    addUnit(paragraph);
  }

  if (current.trim()) {
    flush();
  }

  return chunks;
}
