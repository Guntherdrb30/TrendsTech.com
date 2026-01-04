export type Id = string;

export interface Tenant {
  id: Id;
  name?: string;
}

export interface User {
  id: Id;
  email?: string;
  name?: string;
}

export interface AgentInstance {
  id: Id;
  name?: string;
  status?: string;
}

export interface KnowledgeSource {
  id: Id;
  label?: string;
  kind?: string;
}

export interface ManualPayment {
  id: Id;
  amount?: number;
  currency?: string;
}
