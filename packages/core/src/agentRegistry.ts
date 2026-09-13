import type { AgentChannel, AgentLifecycleStatus } from './agentControlPlane';

export type AgentRuntimeProfile = {
  key: string;
  templateKey: string;
  name: string;
  purpose: string;
  version: number;
  lifecycle: AgentLifecycleStatus;
  deploymentId: string;
  defaultModel: string;
  channels: AgentChannel[];
  mcpKey: string;
  allowedTools: string[];
  maxTurns: number;
  instructions: string[];
};

export const AGENT_REGISTRY = {
  'carpihogar-customer': {
    key: 'carpihogar-customer',
    templateKey: 'customer-service',
    name: 'CarpiHogar AI',
    purpose: 'Atencion, ventas asistidas y operaciones comerciales de CarpiHogar.',
    version: 1,
    lifecycle: 'testing',
    deploymentId: 'pilot:carpihogar:customer-agent:v1',
    defaultModel: 'gpt-5-mini',
    channels: ['web', 'chatgpt', 'whatsapp', 'voice', 'api'],
    mcpKey: 'carpihogar-mcp',
    allowedTools: [
      'get_capabilities', 'search_products', 'get_product', 'view_cart', 'add_to_cart',
      'update_cart_quantity', 'remove_from_cart', 'analyze_design_request', 'analyze_project_document',
      'generate_bom', 'validate_bom_stock', 'create_carpentry_estimate', 'generate_cut_list',
      'add_project_to_cart'
    ],
    maxTurns: 8,
    instructions: [
      'Eres el agente central de CarpiHogar operado por Trends172Tech.',
      'Usa exclusivamente las herramientas proporcionadas para consultar productos, inventario, carrito, diseno, BOM, listas de corte y presupuestos.',
      'Nunca inventes precios, stock, SKU, productos, medidas ni resultados de herramientas.',
      'Para informacion transaccional actual debes usar una herramienta antes de responder.',
      'No afirmes que una accion se completo si la herramienta no lo confirma.',
      'Las acciones que requieren aprobacion humana no se exponen al modelo y deben ejecutarse por el flujo de aprobacion.',
      'Responde en el idioma del usuario y de forma concisa.'
    ]
  },
  'arqui-ai': {
    key: 'arqui-ai',
    templateKey: 'architecture-design',
    name: 'Arqui AI - CarpiHogar',
    purpose: 'Diseno, carpinteria, BOM, inventario tecnico, presupuestos y listas de corte.',
    version: 1,
    lifecycle: 'testing',
    deploymentId: 'pilot:carpihogar:arqui-ai:v1',
    defaultModel: 'gpt-5-mini',
    channels: ['web', 'chatgpt', 'api'],
    mcpKey: 'carpihogar-mcp',
    allowedTools: [
      'get_capabilities', 'search_products', 'get_product', 'analyze_design_request',
      'analyze_project_document', 'generate_bom', 'validate_bom_stock', 'create_carpentry_estimate',
      'generate_cut_list', 'add_project_to_cart'
    ],
    maxTurns: 10,
    instructions: [
      'Eres Arqui AI, especialista de diseno, carpinteria y especificacion tecnica de CarpiHogar, operado centralmente por Trends172Tech.',
      'Convierte necesidades, medidas, planos o documentos de proyecto en una propuesta tecnica verificable.',
      'Usa las herramientas MCP para analizar solicitudes, consultar productos reales, generar BOM, validar stock, crear presupuestos y listas de corte.',
      'Nunca inventes productos, SKU, precios, stock, medidas ni datos faltantes.',
      'Distingue claramente medidas confirmadas, supuestos y datos pendientes.',
      'Cuando falten medidas esenciales, solicita solo la informacion minima necesaria antes de cerrar un BOM o presupuesto.',
      'Agregar un proyecto al carrito requiere aprobacion humana y nunca esta disponible como tool directa del modelo.',
      'Para datos comerciales o de inventario actuales, consulta siempre las herramientas antes de responder.',
      'Responde en el idioma del usuario con estructura clara y profesional.'
    ]
  }
} as const satisfies Record<string, AgentRuntimeProfile>;

export type RegisteredAgentKey = keyof typeof AGENT_REGISTRY;
export const REGISTERED_AGENT_KEYS = Object.keys(AGENT_REGISTRY) as RegisteredAgentKey[];

export function getAgentRuntimeProfile(key: string): AgentRuntimeProfile {
  const profile = AGENT_REGISTRY[key as RegisteredAgentKey];
  if (!profile) throw new Error(`Agent is not registered: ${key}`);
  return profile;
}
