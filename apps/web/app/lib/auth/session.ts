import { headers } from 'next/headers';
import { auth } from './auth';

export async function getServerAuthSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  return {
    ...session,
    user: {
      ...session.user,
      avatarUrl: session.user.image ?? null
    }
  };
}
