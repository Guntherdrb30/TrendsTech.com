export type AgentKey = 'marketing' | 'sales' | 'appointments' | 'support' | 'public_voice';

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
  }
];
