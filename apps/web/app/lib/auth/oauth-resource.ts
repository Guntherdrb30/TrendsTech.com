import { createAuthClient } from 'better-auth/client';
import { oauthProviderResourceClient } from '@better-auth/oauth-provider/resource-client';

import { auth } from './auth';

export const oauthResourceClient = createAuthClient({
  plugins: [oauthProviderResourceClient(auth)]
});
