import 'server-only';

import { validateWorkflowDefinition, type ValidatedWorkflowDefinition } from './workflow-contract';

type Agent = 'FRONTEND'|'BACKEND'|'DATABASE'|'QA'|'SECURITY'|'NVIDIA'|'DEVOPS'|'ORCHESTRATOR';

function includesAny(text: string, values: string[]) {
  return values.some(value => text.includes(value));
}

export function interpretWorkflowNaturalLanguage(textInput: string, reusable = true) {
  const description = textInput.trim();
  if (description.length < 10) return { ok: false as const, errors: ['Describe el workflow con al menos 10 caracteres.'] };
  const text = description.toLowerCase();
  let eventType: ValidatedWorkflowDefinition['trigger']['eventType'] = 'AGENT_RUN_COMPLETED';
  if (includesAny(text, ['cuando falle un agente','si un agente falla','run falla','run falló'])) eventType = 'AGENT_RUN_FAILED';
  else if (includesAny(text, ['cuando qa apruebe','qa aprobado','qa pase'])) eventType = 'QA_PASSED';
  else if (includesAny(text, ['cuando qa falle','qa falla','qa falló'])) eventType = 'QA_FAILED';
  else if (includesAny(text, ['preview listo','deployment listo'])) eventType = 'DEPLOYMENT_READY';
  else if (includesAny(text, ['migración lista','migracion lista'])) eventType = 'MIGRATION_READY';

  const mentions: Array<{ key: string; title: string; agent: Agent; type: ValidatedWorkflowDefinition['actions'][number]['type'] }> = [
    { key: 'frontend', title: 'Frontend', agent: 'FRONTEND', type: 'PREPARE_AGENT_RUN' },
    { key: 'backend', title: 'Backend', agent: 'BACKEND', type: 'PREPARE_AGENT_RUN' },
    { key: 'base de datos', title: 'Database', agent: 'DATABASE', type: 'PREPARE_AGENT_RUN' },
    { key: 'database', title: 'Database', agent: 'DATABASE', type: 'PREPARE_AGENT_RUN' },
    { key: 'qa', title: 'QA', agent: 'QA', type: 'RUN_QA' },
    { key: 'security', title: 'Security', agent: 'SECURITY', type: 'PREPARE_AGENT_RUN' },
    { key: 'seguridad', title: 'Security', agent: 'SECURITY', type: 'PREPARE_AGENT_RUN' },
    { key: 'nvidia', title: 'NVIDIA', agent: 'NVIDIA', type: 'PREPARE_AGENT_RUN' },
    { key: 'preview', title: 'Preview', agent: 'DEVOPS', type: 'PREPARE_AGENT_RUN' },
    { key: 'arquitecto', title: 'Orchestrator', agent: 'ORCHESTRATOR', type: 'PREPARE_AGENT_RUN' }
  ];

  const ordered = mentions
    .map(item => ({ ...item, index: text.indexOf(item.key) }))
    .filter(item => item.index >= 0)
    .sort((a,b) => a.index - b.index);

  const actions: ValidatedWorkflowDefinition['actions'] = [];
  const seen = new Set<string>();
  for (const item of ordered) {
    if (seen.has(item.title)) continue;
    seen.add(item.title);
    actions.push({
      position: actions.length + 1,
      type: item.type,
      agentKey: item.agent,
      requiresApproval: false,
      approvalGate: null,
      config: { title: item.title, instruction: `Ejecutar etapa ${item.title} según la instrucción original.`, sourceText: description }
    });
  }

  if (includesAny(text, ['avísame','avisame','notifica','notificar'])) {
    actions.push({ position: actions.length + 1, type: 'NOTIFY', agentKey: null, requiresApproval: false, approvalGate: null, config: { channel: 'STUDIO', instruction: 'Notificar resultado relevante.' } });
  }
  if (includesAny(text, ['no publiques','nunca publiques','sin mi aprobación','sin mi aprobacion','requiere mi aprobación','requiere mi aprobacion','producción','produccion'])) {
    actions.push({ position: actions.length + 1, type: 'REQUEST_APPROVAL', agentKey: null, requiresApproval: false, approvalGate: 'PRODUCTION_RELEASE', config: { gate: 'PRODUCTION_RELEASE', instruction: 'Esperar aprobación humana antes de producción.' } });
  }
  if (actions.length === 0) {
    actions.push({ position: 1, type: 'RECORD_VAULT_ENTRY', agentKey: null, requiresApproval: false, approvalGate: null, config: { title: 'Workflow natural', instruction: description } });
  }

  const parallel = includesAny(text, ['en paralelo','al mismo tiempo','simultáneamente','simultaneamente']);
  const retryEscalation = /falla\s+(dos|2)\s+veces/.test(text) || /dos\s+fallos/.test(text);
  const definition = {
    name: `Workflow · ${description.slice(0, 72)}${description.length > 72 ? '…' : ''}`,
    description,
    reusable,
    trigger: { type: 'EVENT' as const, eventType },
    actions: actions.map(action => ({
      ...action,
      config: {
        ...action.config,
        ...(parallel ? { executionHint: 'PARALLEL_WHERE_SAFE' } : {}),
        ...(retryEscalation ? { retryPolicy: { maxAttempts: 2, onExhausted: 'ESCALATE_ORCHESTRATOR' } } : {})
      }
    }))
  };

  const validated = validateWorkflowDefinition(definition);
  if (!validated.success) return { ok: false as const, errors: validated.error.issues.map(issue => issue.message) };
  return {
    ok: true as const,
    definition: validated.data,
    interpretation: {
      engine: 'STUDIO_RULES_V2',
      preferredIntelligenceRoute: 'CHATGPT_MCP',
      paidApiUsed: false,
      parallelDetected: parallel,
      retryEscalationDetected: retryEscalation
    }
  };
}
