import { NextResponse } from 'next/server';
import { AuthError, requireRole } from '@/lib/auth/guards';
import { getStudioRunnerSnapshot, provisionStudioRunner } from '@/lib/engineering-studio/studio-runner';

function handleError(error: unknown) {
  if (error instanceof AuthError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  return NextResponse.json(
    { error: error instanceof Error ? error.message : 'Unexpected error' },
    { status: 500 }
  );
}

export async function GET() {
  try {
    await requireRole('ROOT');
    const snapshot = await getStudioRunnerSnapshot();
    return NextResponse.json({ data: snapshot });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireRole('ROOT');
    const body = await request.json().catch(() => ({}));
    const action = typeof body.action === 'string' ? body.action : 'provision';

    if (action !== 'provision' && action !== 'rotate') {
      return NextResponse.json({ error: 'Acción inválida.' }, { status: 400 });
    }

    const result = await provisionStudioRunner(user.id, action === 'rotate');
    return NextResponse.json({ data: result }, { status: action === 'rotate' ? 200 : 201 });
  } catch (error) {
    return handleError(error);
  }
}
