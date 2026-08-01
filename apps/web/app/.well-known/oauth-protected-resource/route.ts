import { oauthResourceClient } from '@/lib/auth/oauth-resource';

const siteUrl = (process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000')
  .replace(/\/$/, '');
const authorizationServerUrl = `${siteUrl}/api/auth`;

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const metadata = await oauthResourceClient.getProtectedResourceMetadata({
    resource: `${siteUrl}/mcp`,
    authorization_servers: [authorizationServerUrl],
    scopes_supported: ['openid', 'profile', 'email', 'offline_access', 'mcp:read', 'mcp:write']
  });

  return Response.json(metadata, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=300'
    }
  });
}
