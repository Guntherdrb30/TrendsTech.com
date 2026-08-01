import { oauthProviderAuthServerMetadata } from '@better-auth/oauth-provider';

import { auth } from '@/lib/auth/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const GET = oauthProviderAuthServerMetadata(auth, {
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'public, max-age=300'
  }
});
