import { z } from 'zod';
import { tool as agentTool, type Tool } from '@openai/agents';
import { prisma, Prisma } from '@trends172tech/db';

export type ToolContext = {
  tenantId: string;
  agentInstanceId: string;
  actorUserId: string;
  sessionId: string;
};

type ToolDefinition = {
  name: string;
  description: string;
  schema: z.AnyZodObject;
  execute: (input: unknown, context: ToolContext) => Promise<Record<string, unknown>>;
};

const createLeadSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().min(3).optional(),
  notes: z.string().max(500).optional()
});

const createAppointmentSchema = z.object({
  date: z.string().min(4),
  name: z.string().min(1),
  phone: z.string().min(3),
  email: z.string().email().optional(),
  notes: z.string().max(500).optional()
});

const pricingInfoSchema = z.object({
  locale: z.enum(['es', 'en']).optional()
});

const requestHumanContactSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().min(3).optional(),
  email: z.string().email().optional(),
  reason: z.string().max(500).optional()
});

async function logAction(context: ToolContext, action: string, entity: string, metaJson: Prisma.InputJsonObject) {
  return prisma.auditLog.create({
    data: {
      actorUserId: context.actorUserId,
      tenantId: context.tenantId,
      action,
      entity,
      entityId: context.agentInstanceId,
      metaJson
    }
  });
}

const TOOL_DEFINITIONS: ToolDefinition[] = [
  {
    name: 'create_lead',
    description: 'Create a new lead with contact information.',
    schema: createLeadSchema,
    execute: async (input, context) => {
      const parsed = createLeadSchema.parse(input);
      const lead = await prisma.endCustomer.create({
        data: {
          tenantId: context.tenantId,
          name: parsed.name,
          email: parsed.email ?? null,
          phone: parsed.phone ?? null
        }
      });

      await logAction(context, 'create_lead', 'lead', {
        leadId: lead.id,
        sessionId: context.sessionId,
        notes: parsed.notes ?? null
      });

      return { status: 'created', leadId: lead.id };
    }
  },
  {
    name: 'create_appointment',
    description: 'Schedule an appointment request.',
    schema: createAppointmentSchema,
    execute: async (input, context) => {
      const parsed = createAppointmentSchema.parse(input);
      const audit = await logAction(context, 'create_appointment', 'appointment', {
        sessionId: context.sessionId,
        date: parsed.date,
        name: parsed.name,
        phone: parsed.phone,
        email: parsed.email ?? null,
        notes: parsed.notes ?? null
      });

      return { status: 'requested', appointmentId: audit.id };
    }
  },
  {
    name: 'get_pricing_info',
    description: 'Return current pricing tiers and limits.',
    schema: pricingInfoSchema,
    execute: async (input, context) => {
      const parsed = pricingInfoSchema.parse(input);
      const plans = await prisma.plan.findMany({
        where: { isActive: true },
        orderBy: { priceUsdMonthly: 'asc' }
      });

      await logAction(context, 'get_pricing_info', 'plan', {
        sessionId: context.sessionId,
        locale: parsed.locale ?? null
      });

      return {
        currency: 'USD',
        plans: plans.map((plan) => ({
          key: plan.key,
          name: parsed.locale === 'es' ? plan.name_es : plan.name_en,
          priceUsdMonthly: plan.priceUsdMonthly.toString(),
          limits: plan.limitsJson ?? null
        }))
      };
    }
  },
  {
    name: 'request_human_contact',
    description: 'Escalate the conversation to a human.',
    schema: requestHumanContactSchema,
    execute: async (input, context) => {
      const parsed = requestHumanContactSchema.parse(input);
      const audit = await logAction(context, 'request_human_contact', 'human_contact', {
        sessionId: context.sessionId,
        name: parsed.name ?? null,
        phone: parsed.phone ?? null,
        email: parsed.email ?? null,
        reason: parsed.reason ?? null
      });

      return { status: 'requested', requestId: audit.id };
    }
  }
];

export function getToolDefinitions(allowedTools?: string[]) {
  if (!allowedTools || allowedTools.length === 0) {
    return TOOL_DEFINITIONS;
  }
  return TOOL_DEFINITIONS.filter((tool) => allowedTools.includes(tool.name));
}

export function getAgentTools(context: ToolContext, allowedTools?: string[]): Tool[] {
  return getToolDefinitions(allowedTools).map((definition) =>
    agentTool({
      name: definition.name,
      description: definition.description,
      parameters: definition.schema,
      execute: async (input) => definition.execute(input, context)
    })
  );
}

export const TOOL_NAMES = TOOL_DEFINITIONS.map((tool) => tool.name);
