-- CreateEnum
CREATE TYPE "SiteAssetSection" AS ENUM ('HOME_HERO', 'HOME_SHOWCASE');

-- CreateTable
CREATE TABLE "SiteAsset" (
    "id" TEXT NOT NULL,
    "section" "SiteAssetSection" NOT NULL,
    "language" "Language" NOT NULL DEFAULT 'ES',
    "eyebrow" TEXT,
    "badge" TEXT,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "blobUrl" TEXT,
    "ctaLabel" TEXT,
    "ctaHref" TEXT,
    "highlightsJson" JSONB,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "updatedByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiteAsset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SiteAsset_section_language_isActive_sortOrder_idx" ON "SiteAsset"("section", "language", "isActive", "sortOrder");

-- CreateIndex
CREATE INDEX "SiteAsset_updatedByUserId_idx" ON "SiteAsset"("updatedByUserId");

-- AddForeignKey
ALTER TABLE "SiteAsset" ADD CONSTRAINT "SiteAsset_updatedByUserId_fkey" FOREIGN KEY ("updatedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
