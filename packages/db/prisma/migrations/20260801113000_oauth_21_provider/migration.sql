CREATE TABLE "OAuthClient" (
  "id" TEXT NOT NULL,
  "clientId" TEXT NOT NULL,
  "clientSecret" TEXT,
  "disabled" BOOLEAN DEFAULT false,
  "skipConsent" BOOLEAN,
  "enableEndSession" BOOLEAN,
  "subjectType" TEXT,
  "scopes" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "userId" TEXT,
  "referenceId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "name" TEXT,
  "uri" TEXT,
  "icon" TEXT,
  "contacts" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "tos" TEXT,
  "policy" TEXT,
  "softwareId" TEXT,
  "softwareVersion" TEXT,
  "softwareStatement" TEXT,
  "redirectUris" TEXT[] NOT NULL,
  "postLogoutRedirectUris" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "tokenEndpointAuthMethod" TEXT,
  "grantTypes" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "responseTypes" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "public" BOOLEAN DEFAULT false,
  "type" TEXT,
  "requirePKCE" BOOLEAN DEFAULT true,
  "metadata" JSONB,
  CONSTRAINT "OAuthClient_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "OAuthRefreshToken" (
  "id" TEXT NOT NULL,
  "token" TEXT NOT NULL,
  "clientId" TEXT NOT NULL,
  "sessionId" TEXT,
  "userId" TEXT NOT NULL,
  "referenceId" TEXT,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "revoked" TIMESTAMP(3),
  "authTime" TIMESTAMP(3),
  "scopes" TEXT[] NOT NULL,
  CONSTRAINT "OAuthRefreshToken_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "OAuthAccessToken" (
  "id" TEXT NOT NULL,
  "token" TEXT NOT NULL,
  "clientId" TEXT NOT NULL,
  "sessionId" TEXT,
  "userId" TEXT,
  "referenceId" TEXT,
  "refreshId" TEXT,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "scopes" TEXT[] NOT NULL,
  CONSTRAINT "OAuthAccessToken_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "OAuthConsent" (
  "id" TEXT NOT NULL,
  "clientId" TEXT NOT NULL,
  "userId" TEXT,
  "referenceId" TEXT,
  "scopes" TEXT[] NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "OAuthConsent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "OAuthClient_clientId_key" ON "OAuthClient"("clientId");
CREATE INDEX "OAuthClient_userId_idx" ON "OAuthClient"("userId");
CREATE UNIQUE INDEX "OAuthRefreshToken_token_key" ON "OAuthRefreshToken"("token");
CREATE INDEX "OAuthRefreshToken_clientId_idx" ON "OAuthRefreshToken"("clientId");
CREATE INDEX "OAuthRefreshToken_sessionId_idx" ON "OAuthRefreshToken"("sessionId");
CREATE INDEX "OAuthRefreshToken_userId_idx" ON "OAuthRefreshToken"("userId");
CREATE UNIQUE INDEX "OAuthAccessToken_token_key" ON "OAuthAccessToken"("token");
CREATE INDEX "OAuthAccessToken_clientId_idx" ON "OAuthAccessToken"("clientId");
CREATE INDEX "OAuthAccessToken_sessionId_idx" ON "OAuthAccessToken"("sessionId");
CREATE INDEX "OAuthAccessToken_userId_idx" ON "OAuthAccessToken"("userId");
CREATE INDEX "OAuthAccessToken_refreshId_idx" ON "OAuthAccessToken"("refreshId");
CREATE INDEX "OAuthConsent_clientId_idx" ON "OAuthConsent"("clientId");
CREATE INDEX "OAuthConsent_userId_idx" ON "OAuthConsent"("userId");

ALTER TABLE "OAuthClient" ADD CONSTRAINT "OAuthClient_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OAuthRefreshToken" ADD CONSTRAINT "OAuthRefreshToken_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "OAuthClient"("clientId") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OAuthRefreshToken" ADD CONSTRAINT "OAuthRefreshToken_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "AuthSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "OAuthRefreshToken" ADD CONSTRAINT "OAuthRefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OAuthAccessToken" ADD CONSTRAINT "OAuthAccessToken_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "OAuthClient"("clientId") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OAuthAccessToken" ADD CONSTRAINT "OAuthAccessToken_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "AuthSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "OAuthAccessToken" ADD CONSTRAINT "OAuthAccessToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OAuthAccessToken" ADD CONSTRAINT "OAuthAccessToken_refreshId_fkey" FOREIGN KEY ("refreshId") REFERENCES "OAuthRefreshToken"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OAuthConsent" ADD CONSTRAINT "OAuthConsent_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "OAuthClient"("clientId") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OAuthConsent" ADD CONSTRAINT "OAuthConsent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
