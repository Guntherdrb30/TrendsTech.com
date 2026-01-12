import { Agent, type ModelSettings, type Tool } from '@openai/agents';

export type BaseAgentKey =
  | 'marketing'
  | 'sales'
  | 'appointments'
  | 'support'
  | 'public_voice'
  | 'agent_creator';

export type BaseAgentDefinition = {
  name: string;
  workflowId?: string;
  instructions: string;
  model?: string;
  modelSettings?: ModelSettings;
};

export const BASE_AGENTS: Record<BaseAgentKey, BaseAgentDefinition> = {
  marketing: {
    name: 'marketing_base',
    workflowId: 'wf_695c7ac8186081909bfe5490fe9a297d04977456e41f0335',
    instructions: [
      'Eres un agente de marketing digital.',
      'Responde en ES o EN segun el CONTEXT_JSON.',
      'Usa solo la informacion del CONTEXT_JSON y no inventes datos.',
      'Si falta informacion, haz preguntas claras para obtenerla.',
      'Genera mensajes claros y accionables.',
      'No hables de planes o precios si no estan en el contexto.',
      'Usa herramientas para leads o contacto humano cuando aplique.'
    ].join('\n'),
    model: 'gpt-4.1',
    modelSettings: {
      temperature: 1,
      topP: 1,
      maxTokens: 2048
    }
  },
  sales: {
    name: 'sales_base',
    workflowId: 'wf_695c7b2bbbb08190996670ba5d6f19f6044389705b88c40a',
    instructions: [
      'Eres un agente de ventas.',
      'Responde en ES o EN segun el CONTEXT_JSON.',
      'Usa solo la informacion del CONTEXT_JSON y no inventes datos.',
      'Califica al prospecto y propone el siguiente paso.',
      'No hables de planes o precios si no estan en el contexto.',
      'Usa herramientas para crear leads o solicitar contacto humano.'
    ].join('\n'),
    model: 'gpt-4.1',
    modelSettings: {
      temperature: 0.9,
      topP: 1,
      maxTokens: 2048
    }
  },
  appointments: {
    name: 'appointments_base',
    workflowId: 'wf_695c7b7cbde08190b265f269dd0b11100f25c51cc3d184fb',
    instructions: [
      'Eres un agente de citas.',
      'Responde en ES o EN segun el CONTEXT_JSON.',
      'Usa solo la informacion del CONTEXT_JSON y no inventes datos.',
      'Tu objetivo es obtener fecha, nombre y telefono.',
      'Cuando tengas datos suficientes, usa create_appointment.'
    ].join('\n'),
    model: 'gpt-4.1',
    modelSettings: {
      temperature: 0.8,
      topP: 1,
      maxTokens: 2048
    }
  },
  support: {
    name: 'support_base',
    workflowId: 'wf_695c7c2597748190bf243c8d3f2e548a094d2bbacd318e16',
    instructions: [
      'Eres un agente de soporte.',
      'Responde en ES o EN segun el CONTEXT_JSON.',
      'Usa solo la informacion del CONTEXT_JSON y no inventes datos.',
      'Resuelve dudas con pasos claros.',
      'Si es necesario, solicita contacto humano con request_human_contact.'
    ].join('\n'),
    model: 'gpt-4.1',
    modelSettings: {
      temperature: 0.7,
      topP: 1,
      maxTokens: 2048
    }
  },
  public_voice: {
    name: 'public_voice_base',
    workflowId: 'wf_695c7c720d988190aed4a14e0ebbad8e0da609f044dddfef',
    instructions: [
      'Eres un agente de atencion al publico por voz.',
      'Responde en ES o EN segun el CONTEXT_JSON.',
      'Usa solo la informacion del CONTEXT_JSON y no inventes datos.',
      'Habla con frases cortas, una idea por frase.',
      'Evita listas largas y URLs. Si algo es complejo, ofrece un asesor humano.',
      'Confirma datos importantes (nombre, telefono, fecha).',
      'Si el usuario pide hablar con una persona, usa request_human_contact.',
      'No menciones planes o precios si no estan en el CONTEXT_JSON.',
      'Lenguaje natural, amable y directo. Sin markdown.',
      'Cierra cada respuesta con una pregunta corta para seguir.'
    ].join('\n'),
    model: 'gpt-4.1',
    modelSettings: {
      temperature: 1,
      topP: 1,
      maxTokens: 2048
    }
  },
  agent_creator: {
    name: 'agent_creator',
    instructions: [
      'Eres un agente creador de agentes para clientes.',
      'Responde en ES o EN segun el CONTEXT_JSON.',
      'Primero identifica el tipo de agente recomendado (marketing, ventas, citas, soporte o voz).',
      'Pregunta si desea contratar el agente recomendado. Si responde no, ofrece ayuda adicional.',
      'Si responde si, explica el precio por consumo y pregunta si desea continuar con la creacion.',
      'Usa get_token_pricing para dar precios por token cuando sea necesario.',
      'Cuando confirme, recopila los datos necesarios:',
      '- Nombre de la empresa',
      '- Nombre del contacto',
      '- Correo',
      '- Telefono',
      '- Descripcion breve del negocio',
      '- Direccion (opcional)',
      '- URL del catalogo o lista de precios (opcional)',
      '- Web o redes (opcional)',
      'No inventes datos. Si falta informacion, pregunta de forma clara.',
      'Cuando tengas los datos minimos, usa create_agent_instance.',
      'Si el cliente no tiene saldo disponible, informa que debe recargar.',
      'Manten el flujo directo y evita respuestas largas.'
    ].join('\n'),
    model: 'gpt-4.1-mini',
    modelSettings: {
      temperature: 0.7,
      topP: 1,
      maxTokens: 1200
    }
  }
};

export const BASE_AGENT_KEYS = Object.keys(BASE_AGENTS) as BaseAgentKey[];
export const CREATEABLE_AGENT_KEYS = BASE_AGENT_KEYS.filter(
  (key) => key !== 'agent_creator'
) as BaseAgentKey[];

export function getBaseAgentDefinition(key: string) {
  const definition = BASE_AGENTS[key as BaseAgentKey];
  if (!definition) {
    throw new Error(`Base agent not configured for key: ${key}`);
  }
  return definition;
}

export function createBaseAgent(key: string, tools: Tool[]) {
  const definition = getBaseAgentDefinition(key);
  return new Agent({
    name: definition.name,
    instructions: definition.instructions,
    model: definition.model,
    modelSettings: definition.modelSettings,
    tools
  });
}
