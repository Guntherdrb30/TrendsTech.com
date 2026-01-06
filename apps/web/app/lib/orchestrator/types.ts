export type OrchestratorRole = 'user' | 'assistant' | 'system';

export interface OrchestratorMessage {
  role: OrchestratorRole;
  content: string;
}

export interface OrchestratorRequest {
  agentInstanceId: string;
  sessionId: string;
  message: string;
  channel?: string;
  language?: string;
  pageUrl?: string;
  installId?: string;
  endUser?: {
    id?: string;
    name?: string;
    email?: string;
    phone?: string;
  };
}

export interface OrchestratorResponse {
  reply: string;
}
