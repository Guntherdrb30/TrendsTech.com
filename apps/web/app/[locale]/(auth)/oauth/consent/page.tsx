import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { OAuthConsentCard } from '@/components/oauth-consent-card';
import { auth } from '@/lib/auth/auth';
import { getServerAuthSession } from '@/lib/auth/session';

export default async function OAuthConsentPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ client_id?: string; scope?: string }>;
}) {
  const [{ locale }, query, session] = await Promise.all([
    params,
    searchParams,
    getServerAuthSession()
  ]);

  if (!session) {
    redirect(`/${locale}/login`);
  }

  if (!query.client_id) {
    return <OAuthConsentCard clientName="Cliente desconocido" scopes={[]} locale={locale} />;
  }

  const client = await auth.api.getOAuthClientPublic({
    query: { client_id: query.client_id },
    headers: await headers()
  });
  const scopes = (query.scope ?? '').split(' ').map((scope) => scope.trim()).filter(Boolean);

  return (
    <OAuthConsentCard
      clientName={client?.client_name || (locale.startsWith('es') ? 'Aplicación conectada' : 'Connected application')}
      clientUri={client?.client_uri}
      scopes={scopes}
      locale={locale}
    />
  );
}
