export type OrchestratorRole = 'user' | 'assistant' | 'system';

export interface OrchestratorMessage {
  role: OrchestratorRole;
  content: string;
}

export interface OrchestratorRequest {
  messages: OrchestratorMessage[];
}
