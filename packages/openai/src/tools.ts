import { z } from 'zod';
import { tool as agentTool, type Tool } from '@openai/agents';
import { prisma, Prisma } from '@trends172tech/db';
import { CREATEABLE_AGENT_KEYS } from './baseAgents';

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

const getTokenPricingSchema = z.object({});

const createAgentInstanceSchema = z
  .object({
    name: z.string().min(2),
    baseAgentKey: z.enum(CREATEABLE_AGENT_KEYS as [string, ...string[]]),
    languageDefault: z.enum(['ES', 'EN']).optional().default('ES'),
    status: z.enum(['DRAFT', 'ACTIVE', 'PAUSED']).optional().default('DRAFT'),
    companyName: z.string().min(2).max(120),
    contactName: z.string().min(2).max(120),
    contactEmail: z.string().email().optional(),
    contactPhone: z.string().min(4).max(40).optional(),
    description: z.string().min(10).max(1200),
    address: z.string().min(4).max(200).optional(),
    website: z.string().url().max(200).optional(),
    catalogUrl: z.string().url().max(400).optional(),
    priceListUrl: z.string().url().max(400).optional(),
    notes: z.string().max(800).optional(),
    endCustomerName: z.string().min(2).max(120).optional(),
    endCustomerEmail: z.string().email().optional(),
    endCustomerPhone: z.string().min(4).max(40).optional()
  })
  .refine((data) => Boolean(data.contactEmail || data.contactPhone), {
    message: 'contactEmail or contactPhone is required',
    path: ['contactEmail']
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

const DEFAULT_TOKEN_PRICING = {
  inputUsdPer1M: 0.4,
  outputUsdPer1M: 1.6,
  cachedInputUsdPer1M: 0.1,
  markupPercent: 30
};

function toNumber(value: Prisma.Decimal | number | null | undefined, fallback: number) {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : fallback;
  }
  if (!value) {
    return fallback;
  }
  const numeric = Number(value.toString());
  return Number.isFinite(numeric) ? numeric : fallback;
}

async function resolveTokenPricing() {
  const settings = await prisma.globalSettings.findUnique({ where: { id: 1 } });
  if (!settings) {
    return DEFAULT_TOKEN_PRICING;
  }
  return {
    inputUsdPer1M: toNumber(settings.tokenInputUsdPer1M, DEFAULT_TOKEN_PRICING.inputUsdPer1M),
    outputUsdPer1M: toNumber(settings.tokenOutputUsdPer1M, DEFAULT_TOKEN_PRICING.outputUsdPer1M),
    cachedInputUsdPer1M: toNumber(settings.tokenCachedInputUsdPer1M, DEFAULT_TOKEN_PRICING.cachedInputUsdPer1M),
    markupPercent: toNumber(settings.tokenMarkupPercent, DEFAULT_TOKEN_PRICING.markupPercent)
  };
}

function applyMarkup(value: number, markupPercent: number) {
  return value * (1 + markupPercent / 100);
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
  },
  {
    name: 'get_token_pricing',
    description: 'Return token pricing per 1M tokens with markup applied.',
    schema: getTokenPricingSchema,
    execute: async (_, context) => {
      const pricing = await resolveTokenPricing();

      await logAction(context, 'get_token_pricing', 'pricing', {
        sessionId: context.sessionId
      });

      return {
        currency: 'USD',
        markupPercent: pricing.markupPercent,
        openai: {
          inputPer1M: pricing.inputUsdPer1M,
          cachedInputPer1M: pricing.cachedInputUsdPer1M,
          outputPer1M: pricing.outputUsdPer1M
        },
        customer: {
          inputPer1M: applyMarkup(pricing.inputUsdPer1M, pricing.markupPercent),
          cachedInputPer1M: applyMarkup(pricing.cachedInputUsdPer1M, pricing.markupPercent),
          outputPer1M: applyMarkup(pricing.outputUsdPer1M, pricing.markupPercent)
        }
      };
    }
  },
  {
    name: 'create_agent_instance',
    description: 'Create a new agent instance for the tenant after collecting onboarding data.',
    schema: createAgentInstanceSchema,
    execute: async (input, context) => {
      const parsed = createAgentInstanceSchema.parse(input);

      const callerAgent = await prisma.agentInstance.findUnique({
        where: { id: context.agentInstanceId }
      });
      if (!callerAgent || callerAgent.baseAgentKey !== 'agent_creator') {
        throw new Error('Tool not allowed for this agent.');
      }

      const tenant = await prisma.tenant.findUnique({ where: { id: context.tenantId } });
      if (!tenant) {
        throw new Error('Tenant not found.');
      }

      const wallet = await prisma.tokenWallet.findUnique({ where: { tenantId: context.tenantId } });
      if (!wallet || wallet.balance <= 0) {
        throw new Error('Saldo insuficiente. Recarga tu saldo para continuar.');
      }

      const pendingUsage = await prisma.tokenUsageLog.aggregate({
        where: {
          tenantId: context.tenantId,
          sessionId: context.sessionId,
          billedAt: null
        },
        _sum: { costUsdMicros: true }
      });
      const pendingCost = pendingUsage._sum.costUsdMicros ?? 0;

      if (pendingCost > wallet.balance) {
        throw new Error('Saldo insuficiente para finalizar la creacion del agente.');
      }

      const onboarding = {
        companyName: parsed.companyName,
        contactName: parsed.contactName,
        contactEmail: parsed.contactEmail ?? null,
        contactPhone: parsed.contactPhone ?? null,
        description: parsed.description,
        address: parsed.address ?? null,
        website: parsed.website ?? null,
        catalogUrl: parsed.catalogUrl ?? null,
        priceListUrl: parsed.priceListUrl ?? null,
        notes: parsed.notes ?? null
      };

      let endCustomerId: string | null = null;
      if (tenant.mode === 'RESELLER' && parsed.endCustomerName) {
        const endCustomer = await prisma.endCustomer.create({
          data: {
            tenantId: context.tenantId,
            name: parsed.endCustomerName,
            email: parsed.endCustomerEmail ?? null,
            phone: parsed.endCustomerPhone ?? null
          }
        });
        endCustomerId = endCustomer.id;
      }

      const agentInstance = await prisma.agentInstance.create({
        data: {
          tenantId: context.tenantId,
          name: parsed.name,
          baseAgentKey: parsed.baseAgentKey,
          languageDefault: parsed.languageDefault ?? 'ES',
          status: parsed.status ?? 'DRAFT',
          endCustomerId,
          featuresJson: {
            contactPhone: parsed.contactPhone ?? null,
            onboarding
          }
        }
      });

      await prisma.tokenUsageLog.updateMany({
        where: {
          tenantId: context.tenantId,
          sessionId: context.sessionId,
          billedAt: null
        },
        data: { billedAt: new Date() }
      });

      if (pendingCost > 0) {
        await prisma.tokenWallet.update({
          where: { tenantId: context.tenantId },
          data: { balance: { decrement: pendingCost } }
        });
      }

      await logAction(context, 'create_agent_instance', 'agent_instance', {
        agentInstanceId: agentInstance.id,
        baseAgentKey: parsed.baseAgentKey,
        sessionId: context.sessionId
      });

      return {
        status: 'created',
        agentInstanceId: agentInstance.id,
        billedUsdMicros: pendingCost
      };
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
