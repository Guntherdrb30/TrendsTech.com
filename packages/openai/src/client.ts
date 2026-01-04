export interface OpenAIClientConfig {
  apiKey?: string;
  organization?: string;
}

export type OpenAIClient = Record<string, never>;

export function createOpenAIClient(_config: OpenAIClientConfig): OpenAIClient {
  return {};
}
