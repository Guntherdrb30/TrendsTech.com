import { oauthResourceClient } from '@/lib/auth/oauth-resource';

const siteUrl = (process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000')
  .replace(/\/$/, '');

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const metadata = await oauthResourceClient.getProtectedResourceMetadata({
    resource: `${siteUrl}/mcp`,
    authorization_servers: [siteUrl],
    scopes_supported: ['mcp:read', 'mcp:write']
  });

  return Response.json(metadata, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=300'
    }
  });
}
