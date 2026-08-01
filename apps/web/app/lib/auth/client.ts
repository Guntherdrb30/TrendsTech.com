'use client';

import { createAuthClient } from 'better-auth/react';
import { inferAdditionalFields, jwtClient } from 'better-auth/client/plugins';
import { oauthProviderClient } from '@better-auth/oauth-provider/client';
import type { auth } from './auth';

export const authClient = createAuthClient({
  plugins: [inferAdditionalFields<typeof auth>(), jwtClient(), oauthProviderClient()]
});
