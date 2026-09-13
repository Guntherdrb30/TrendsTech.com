import type { ApprovalPolicy, ToolRiskLevel } from './agentControlPlane';

export type McpToolDescriptor = {
  name: string;
  risk: ToolRiskLevel;
  approval: ApprovalPolicy;
  description: string;
};

export type McpServerDescriptor = {
  key: string;
  name: string;
  owner: string;
  endpoint: string;
  status: 'pilot' | 'active' | 'paused';
  tenantBindingRequired: boolean;
  tools: McpToolDescriptor[];
};

export const CARPIHOGAR_MCP: McpServerDescriptor = {
  key: 'carpihogar-mcp',
  name: 'CarpiHogar MCP',
  owner: 'CarpiHogar',
  endpoint: 'https://carpihogar.com/api/chatgpt/mcp',
  status: 'pilot',
  tenantBindingRequired: true,
  tools: [
    { name: 'search_products', risk: 'read', approval: 'automatic', description: 'Busca productos reales del catalogo.' },
    { name: 'get_product', risk: 'read', approval: 'automatic', description: 'Consulta detalle actualizado de un producto.' },
    { name: 'view_cart', risk: 'read', approval: 'automatic', description: 'Consulta un carrito existente.' },
    { name: 'add_to_cart', risk: 'write', approval: 'policy', description: 'Agrega un producto al carrito.' },
    { name: 'update_cart_quantity', risk: 'write', approval: 'policy', description: 'Actualiza cantidad en el carrito.' },
    { name: 'remove_from_cart', risk: 'write', approval: 'policy', description: 'Elimina un producto del carrito.' },
    { name: 'get_capabilities', risk: 'read', approval: 'automatic', description: 'Lista capacidades del MCP.' },
    { name: 'analyze_design_request', risk: 'read', approval: 'automatic', description: 'Estructura una solicitud de diseno o carpinteria.' },
    { name: 'analyze_project_document', risk: 'read', approval: 'automatic', description: 'Estructura informacion extraida de un plano o proyecto.' },
    { name: 'generate_bom', risk: 'read', approval: 'automatic', description: 'Genera una BOM preliminar con productos confirmados.' },
    { name: 'validate_bom_stock', risk: 'read', approval: 'automatic', description: 'Valida cantidades de una BOM contra stock suministrado.' },
    { name: 'create_carpentry_estimate', risk: 'read', approval: 'automatic', description: 'Calcula presupuesto preliminar desde una BOM.' },
    { name: 'generate_cut_list', risk: 'read', approval: 'automatic', description: 'Genera lista de corte preliminar o lista para corte.' },
    { name: 'add_project_to_cart', risk: 'write', approval: 'human_required', description: 'Crea un carrito unico desde una BOM aprobada.' }
  ]
};

export const MCP_REGISTRY: Record<string, McpServerDescriptor> = {
  [CARPIHOGAR_MCP.key]: CARPIHOGAR_MCP
};

export function getMcpServerDescriptor(key: string): McpServerDescriptor {
  const descriptor = MCP_REGISTRY[key];
  if (!descriptor) throw new Error(`MCP server not registered: ${key}`);
  return descriptor;
}
