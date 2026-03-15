export type AgentKey =
  | 'marketing'
  | 'sales'
  | 'appointments'
  | 'support'
  | 'public_voice'
  | 'luna_code_orchestrator';

export type AgentProduct = {
  key: AgentKey;
  featureKeys: string[];
  stepKeys: string[];
  outcomeKeys: string[];
};

export const AGENT_PRODUCTS: AgentProduct[] = [
  {
    key: 'marketing',
    featureKeys: ['f1', 'f2', 'f3'],
    stepKeys: ['s1', 's2', 's3'],
    outcomeKeys: ['o1', 'o2']
  },
  {
    key: 'sales',
    featureKeys: ['f1', 'f2', 'f3'],
    stepKeys: ['s1', 's2', 's3'],
    outcomeKeys: ['o1', 'o2']
  },
  {
    key: 'appointments',
    featureKeys: ['f1', 'f2', 'f3'],
    stepKeys: ['s1', 's2', 's3'],
    outcomeKeys: ['o1', 'o2']
  },
  {
    key: 'support',
    featureKeys: ['f1', 'f2', 'f3'],
    stepKeys: ['s1', 's2', 's3'],
    outcomeKeys: ['o1', 'o2']
  },
  {
    key: 'public_voice',
    featureKeys: ['f1', 'f2', 'f3'],
    stepKeys: ['s1', 's2', 's3'],
    outcomeKeys: ['o1', 'o2']
  },
  {
    key: 'luna_code_orchestrator',
    featureKeys: ['f1', 'f2', 'f3', 'f4', 'f5'],
    stepKeys: ['s1', 's2', 's3', 's4'],
    outcomeKeys: ['o1', 'o2', 'o3']
  }
];
