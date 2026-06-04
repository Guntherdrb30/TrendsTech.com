-- CreateTable
CREATE TABLE "Skill" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "industryEn" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "descriptionEn" TEXT NOT NULL,
    "promptJson" JSONB NOT NULL,
    "mapJson" JSONB NOT NULL,
    "questionsJson" JSONB NOT NULL,
    "priceMonthly" DOUBLE PRECISION NOT NULL DEFAULT 15,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Skill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentSkill" (
    "id" TEXT NOT NULL,
    "agentInstanceId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "configJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AgentSkill_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Skill_key_key" ON "Skill"("key");

-- CreateIndex
CREATE UNIQUE INDEX "AgentSkill_agentInstanceId_skillId_key" ON "AgentSkill"("agentInstanceId", "skillId");

-- CreateIndex
CREATE INDEX "AgentSkill_agentInstanceId_idx" ON "AgentSkill"("agentInstanceId");

-- CreateIndex
CREATE INDEX "AgentSkill_skillId_idx" ON "AgentSkill"("skillId");

-- AddForeignKey
ALTER TABLE "AgentSkill" ADD CONSTRAINT "AgentSkill_agentInstanceId_fkey"
    FOREIGN KEY ("agentInstanceId") REFERENCES "AgentInstance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentSkill" ADD CONSTRAINT "AgentSkill_skillId_fkey"
    FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
