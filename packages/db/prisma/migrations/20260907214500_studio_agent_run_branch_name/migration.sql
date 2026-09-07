-- Engineering Studio prepares each coding run on an isolated GitHub branch.
-- Keep this migration idempotent because some environments may already have
-- the column from a manual or preview migration.
ALTER TABLE "StudioAgentRun"
  ADD COLUMN IF NOT EXISTS "branchName" TEXT;

CREATE INDEX IF NOT EXISTS "StudioAgentRun_projectId_branchName_idx"
  ON "StudioAgentRun" ("projectId", "branchName");
