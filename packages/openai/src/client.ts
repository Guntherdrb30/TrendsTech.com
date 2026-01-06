import OpenAI from 'openai';

export interface OpenAIClientConfig {
  apiKey?: string;
  organization?: string;
  project?: string;
  timeoutMs?: number;
}

export type OpenAIClient = OpenAI;

export function createOpenAIClient(config: OpenAIClientConfig): OpenAIClient {
  if (!config.apiKey) {
    throw new Error('OPENAI_API_KEY is required');
  }

  return new OpenAI({
    apiKey: config.apiKey,
    organization: config.organization,
    project: config.project,
    timeout: config.timeoutMs ?? 20000
  });
}

export function getOpenAIRequestId(error: unknown): string | null {
  if (!error || typeof error !== 'object') {
    return null;
  }

  const requestId = (error as { request_id?: string }).request_id;
  if (requestId) {
    return requestId;
  }

  const headers = (error as { headers?: { get?: (key: string) => string | null } }).headers;
  if (headers?.get) {
    return headers.get('x-request-id');
  }

  return null;
}
