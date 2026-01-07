DO $$ BEGIN
  CREATE TYPE "WhatsAppProvider" AS ENUM ('META', 'BSP');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "WhatsAppChannelStatus" AS ENUM ('ACTIVE', 'PAUSED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "WhatsAppChannel" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "agentInstanceId" TEXT NOT NULL,
  "phoneNumber" TEXT NOT NULL,
  "provider" "WhatsAppProvider" NOT NULL DEFAULT 'META',
  "status" "WhatsAppChannelStatus" NOT NULL DEFAULT 'ACTIVE',
  "webhookSecret" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "WhatsAppChannel_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "WhatsAppChannel_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "WhatsAppChannel_agentInstanceId_fkey" FOREIGN KEY ("agentInstanceId") REFERENCES "AgentInstance"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "WhatsAppChannel_agentInstanceId_key" ON "WhatsAppChannel"("agentInstanceId");
CREATE UNIQUE INDEX IF NOT EXISTS "WhatsAppChannel_phoneNumber_key" ON "WhatsAppChannel"("phoneNumber");
CREATE INDEX IF NOT EXISTS "WhatsAppChannel_tenantId_idx" ON "WhatsAppChannel"("tenantId");
