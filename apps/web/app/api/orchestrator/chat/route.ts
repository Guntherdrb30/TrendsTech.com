import { NextResponse } from 'next/server';
import { z } from 'zod';
import { runOrchestrator } from '@/lib/orchestrator/engine';
import { AuthError, requireAuth } from '@/lib/auth/guards';

const orchestratorSchema = z.object({
  agentInstanceId: z.string().min(1),
  sessionId: z.string().min(1),
  message: z.string().min(1).max(4000),
  channel: z.string().optional(),
  endUser: z
    .object({
      id: z.string().optional(),
      name: z.string().optional(),
      email: z.string().optional(),
      phone: z.string().optional()
    })
    .optional()
});

function handleError(error: unknown) {
  if (error instanceof AuthError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    if (!user.tenantId) {
      return NextResponse.json({ error: 'Tenant required' }, { status: 403 });
    }

    const body = await request.json();
    const parsed = orchestratorSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
    }

    const response = await runOrchestrator(parsed.data, user.id, user.tenantId);
    return NextResponse.json(response);
  } catch (error) {
    return handleError(error);
  }
}
