import { z } from 'zod';

export const workflowEventSchema = z.enum([
  'AGENT_RUN_COMPLETED','AGENT_RUN_FAILED','QA_PASSED','QA_FAILED','BUDGET_THRESHOLD_REACHED',
  'PULL_REQUEST_READY','DEPLOYMENT_READY','DEPLOYMENT_FAILED','MIGRATION_READY',
  'HUMAN_APPROVAL_GRANTED','HUMAN_APPROVAL_REJECTED','PROJECT_BLOCKED'
]);

export const workflowAgentSchema = z.enum([
  'ORCHESTRATOR','FRONTEND','BACKEND','DATABASE','QA','SECURITY','NVIDIA','DEVOPS'
]);

export const workflowActionSchema = z.object({
  position: z.number().int().min(1).max(100),
  type: z.enum([
    'BUILD_CONTEXT_PACK','CREATE_BACKLOG_TASK','REQUEST_APPROVAL','RECORD_VAULT_ENTRY',
    'RECORD_VAULT_NOTE','NOTIFY','PREPARE_AGENT_RUN','RUN_QA','PAUSE_PROJECT'
  ]),
  agentKey: workflowAgentSchema.nullable().optional(),
  requiresApproval: z.boolean().default(false),
  approvalGate: z.string().max(120).nullable().optional(),
  config: z.record(z.string(), z.unknown()).default({})
});

export const workflowDefinitionSchema = z.object({
  name: z.string().min(3).max(180),
  description: z.string().min(10).max(20000),
  projectId: z.string().uuid().nullable().optional(),
  reusable: z.boolean().default(true),
  trigger: z.object({
    type: z.literal('EVENT'),
    eventType: workflowEventSchema
  }),
  actions: z.array(workflowActionSchema).min(1).max(100)
}).superRefine((value, ctx) => {
  const positions = value.actions.map(action => action.position);
  if (new Set(positions).size !== positions.length) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['actions'], message: 'Las posiciones de las acciones deben ser únicas.' });
  }
  const sorted = [...positions].sort((a,b)=>a-b);
  if (sorted.some((position,index)=>position !== index + 1)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['actions'], message: 'Las posiciones deben ser consecutivas desde 1.' });
  }
  for (const action of value.actions) {
    if (action.type === 'REQUEST_APPROVAL' && !action.approvalGate && typeof action.config.gate !== 'string') {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['actions', action.position - 1], message: 'REQUEST_APPROVAL requiere approvalGate o config.gate.' });
    }
  }
});

export type ValidatedWorkflowDefinition = z.infer<typeof workflowDefinitionSchema>;

export function validateWorkflowDefinition(input: unknown) {
  return workflowDefinitionSchema.safeParse(input);
}
