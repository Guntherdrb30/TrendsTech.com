import * as cheerio from 'cheerio';
import { prisma } from '@trends172tech/db';
import { chunkText } from './chunker';
import { embedTexts } from './embeddings';
import { buildChunkRecords, clearChunksForSource, insertChunks } from './vector';
import { normalizeText } from './text';
import { detectLanguage } from './language';
import { isAllowedByRobots } from './robots';
import { URL_PAGE_LIMIT_DEFAULT, URL_PAGE_LIMIT_HARD } from './config';
import type { KnowledgeLogger } from './logs';

type CrawledPage = {
  url: string;
  title: string;
  text: string;
};

function extractTextFromHtml(html: string) {
  const $ = cheerio.load(html);
  $('script, style, noscript, nav, footer, header, aside').remove();

  const root = $('main').length > 0 ? $('main') : $('body');
  const blocks: string[] = [];
  let currentSection = '';

  root.find('h1, h2, h3, h4, h5, h6, p, li').each((_, element) => {
    const tag = element.tagName.toLowerCase();
    const text = $(element).text().trim();
    if (!text) {
      return;
    }
    if (tag.startsWith('h')) {
      currentSection = text;
      blocks.push(text);
      return;
    }
    if (currentSection) {
      blocks.push(`${currentSection}: ${text}`);
    } else {
      blocks.push(text);
    }
  });

  const title = $('title').first().text().trim();
  return {
    title: title || blocks[0] || 'URL',
    text: normalizeText(blocks.join('\n\n'))
  };
}

function normalizeUrl(rawUrl: string) {
  const url = new URL(rawUrl);
  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error('Unsupported URL protocol');
  }
  url.hash = '';
  return url.toString();
}

function isSameHost(base: URL, candidate: URL) {
  return base.host === candidate.host;
}

async function crawlUrl(startUrl: string, limit: number) {
  const queue: string[] = [startUrl];
  const seen = new Set<string>();
  const pages: CrawledPage[] = [];

  while (queue.length > 0 && pages.length < limit) {
    const next = queue.shift();
    if (!next || seen.has(next)) {
      continue;
    }
    seen.add(next);

    const url = new URL(next);
    const allowed = await isAllowedByRobots(url);
    if (!allowed) {
      continue;
    }

    const response = await fetch(url, {
      headers: { 'user-agent': 'trends172tech-bot' }
    });
    if (!response.ok) {
      continue;
    }

    const html = await response.text();
    const { title, text } = extractTextFromHtml(html);
    if (text) {
      pages.push({ url: url.toString(), title, text });
    }

    if (pages.length >= limit) {
      break;
    }

    const $ = cheerio.load(html);
    $('a[href]').each((_, element) => {
      const href = $(element).attr('href');
      if (!href) {
        return;
      }
      try {
        const candidate = new URL(href, url.origin);
        if (!candidate.protocol.startsWith('http')) {
          return;
        }
        if (!isSameHost(url, candidate)) {
          return;
        }
        const normalized = normalizeUrl(candidate.toString());
        if (!seen.has(normalized) && pages.length + queue.length < limit) {
          queue.push(normalized);
        }
      } catch {
        return;
      }
    });
  }

  return pages;
}

async function resolveUrlPageLimit() {
  const settings = await prisma.globalSettings.findUnique({ where: { id: 1 } });
  const limit = settings?.kbUrlPageLimit ?? URL_PAGE_LIMIT_DEFAULT;
  return Math.min(Math.max(limit, 1), URL_PAGE_LIMIT_HARD);
}

export async function ingestUrl(params: {
  sourceId: string;
  tenantId: string;
  agentInstanceId: string;
  url: string;
  title?: string | null;
  logger?: KnowledgeLogger;
}) {
  const normalizedUrl = normalizeUrl(params.url);
  const pageLimit = await resolveUrlPageLimit();

  await prisma.knowledgeSource.update({
    where: { id: params.sourceId },
    data: {
      title: params.title ?? normalizedUrl,
      url: normalizedUrl,
      status: 'PROCESSING'
    }
  });
  await params.logger?.({
    message: 'URL processing started',
    progress: 5,
    status: 'PROCESSING',
    stage: 'start'
  });

  const pages = await crawlUrl(normalizedUrl, pageLimit);
  if (pages.length === 0) {
    throw new Error('No readable content found for URL');
  }
  await params.logger?.({
    message: `Fetched ${pages.length} pages`,
    progress: 30,
    stage: 'crawl'
  });
  const resolvedTitle = params.title ?? pages[0]?.title ?? normalizedUrl;
  const combinedText = normalizeText(pages.map((page) => page.text).join('\n\n'));
  const language = detectLanguage(combinedText);

  await prisma.knowledgeSource.update({
    where: { id: params.sourceId },
    data: {
      title: resolvedTitle,
      rawText: combinedText,
      status: 'PROCESSING'
    }
  });
  await params.logger?.({
    message: 'Normalized content',
    progress: 40,
    stage: 'normalize'
  });

  await clearChunksForSource(params.sourceId);

  const chunks = pages.flatMap((page) =>
    chunkText(page.text, {
      source: 'URL',
      title: page.title,
      section: 'Pagina',
      url: page.url,
      language
    })
  );
  if (chunks.length === 0) {
    throw new Error('No chunks created from URL content');
  }
  await params.logger?.({
    message: `Created ${chunks.length} chunks`,
    progress: 60,
    stage: 'chunk'
  });

  const embeddings = await embedTexts(chunks.map((chunk) => chunk.content));
  if (embeddings.length !== chunks.length) {
    throw new Error('Embedding count mismatch');
  }
  await params.logger?.({
    message: 'Embeddings generated',
    progress: 80,
    stage: 'embed'
  });
  const records = buildChunkRecords(
    chunks.map((chunk, index) => ({
      content: chunk.content,
      embedding: embeddings[index] ?? [],
      tokenCount: chunk.tokenCount,
      metaJson: chunk.meta
    }))
  );

  await insertChunks({
    tenantId: params.tenantId,
    agentInstanceId: params.agentInstanceId,
    sourceId: params.sourceId,
    chunks: records
  });
  await params.logger?.({
    message: 'Indexed chunks',
    progress: 95,
    stage: 'index'
  });

  await prisma.knowledgeSource.update({
    where: { id: params.sourceId },
    data: { status: 'READY' }
  });
  await params.logger?.({
    message: 'Ingest completed',
    progress: 100,
    status: 'READY',
    stage: 'done'
  });
}
