import { NextResponse } from 'next/server';
import { z } from 'zod';
import { AuthError, requireAuth } from '@/lib/auth/guards';
import { auth } from '@/lib/auth/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const passwordSchema = z.object({
  currentPassword: z.string().min(12).max(128),
  newPassword: z.string().min(12).max(128)
});

function handleError(error: unknown) {
  if (error instanceof AuthError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  if (error instanceof z.ZodError) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
}

export async function POST(request: Request) {
  try {
    await requireAuth();
    const payload = passwordSchema.parse(await request.json());

    if (payload.currentPassword === payload.newPassword) {
      return NextResponse.json(
        { error: 'New password must be different from current password.' },
        { status: 400 }
      );
    }

    await auth.api.changePassword({
      body: {
        currentPassword: payload.currentPassword,
        newPassword: payload.newPassword,
        revokeOtherSessions: true
      },
      headers: request.headers
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleError(error);
  }
}
