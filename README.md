# Trends172 Tech

Trends172 Tech is a multi-tenant SaaS platform for building, selling, and embedding AI agents for business analysis.

## Stack
- Next.js 15.5 (App Router)
- TypeScript
- Tailwind CSS + shadcn/ui
- next-intl (es/en)
- next-themes (light/dark/system)
- Prisma + Postgres
- Monorepo: apps/web, apps/widget, packages/*

## Local development
1. Copy `.env.example` to `.env`
2. Install dependencies: `npm install`
3. Run dev: `npm run dev`
4. Open `http://localhost:3000`

## Database setup (PROM 2)
1. Set `DATABASE_URL`, `AUTH_SECRET`, `ROOT_EMAIL`, and `ROOT_PASSWORD` in `.env`
   - Supabase: `DATABASE_URL` = pooler URL (often `POSTGRES_PRISMA_URL`)
   - Supabase: `DIRECT_URL` = non-pooling URL (often `POSTGRES_URL_NON_POOLING`)
2. Run migrations:
   - `npm run db:migrate`
   - or `pnpm --filter @trends172tech/db prisma migrate dev`
3. Seed dev data:
   - `npm run db:seed`
   - or `pnpm --filter @trends172tech/db prisma db seed`
4. Optional Prisma Studio:
   - `npm run db:studio`
   - or `pnpm --filter @trends172tech/db prisma studio`

Seed creates:
- Global settings (USD/VES rate)
- Starter plan
- ROOT user (from `.env`, or generated if missing)
- Demo tenant + tenant_admin user

## Next modules
- PROM 3: agent orchestrator API /v1/chat and routing base
- Agent Builder integration
- Orchestrator and knowledge ingestion
- Widget distribution pipeline
