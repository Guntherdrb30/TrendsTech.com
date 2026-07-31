import { neon } from '@neondatabase/serverless';

const databaseUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
const adminEmail = (process.env.AUTH_ADMIN_EMAIL || 'trends172tech@gmail.com').trim().toLowerCase();

if (!databaseUrl) {
  throw new Error('DIRECT_URL or DATABASE_URL is required.');
}

const sql = neon(databaseUrl);
const [tables, users, migration, administrator] = await Promise.all([
  sql`
    SELECT
      to_regclass('"AuthSession"') IS NOT NULL AS "authSession",
      to_regclass('"AuthAccount"') IS NOT NULL AS "authAccount",
      to_regclass('"AuthVerification"') IS NOT NULL AS "authVerification",
      to_regclass('"AuthJwks"') IS NOT NULL AS "authJwks",
      to_regclass('"rateLimit"') IS NOT NULL AS "rateLimit"
  `,
  sql`SELECT COUNT(*)::int AS count FROM "User"`,
  sql`
    SELECT EXISTS (
      SELECT 1
      FROM "_prisma_migrations"
      WHERE migration_name = '20260721143000_better_auth_foundation'
        AND finished_at IS NOT NULL
        AND rolled_back_at IS NULL
    ) AS applied
  `,
  sql`
    SELECT EXISTS (
      SELECT 1
      FROM "User" AS u
      INNER JOIN "AuthAccount" AS a ON a."userId" = u."id"
      WHERE lower(u."email") = ${adminEmail}
        AND u."role" = 'ROOT'
        AND u."emailVerified" = true
        AND a."providerId" = 'credential'
        AND a."password" IS NOT NULL
    ) AS ready
  `
]);

console.log(JSON.stringify({
  tables: tables[0],
  userCount: users[0]?.count ?? 0,
  migrationApplied: migration[0]?.applied ?? false,
  administratorReady: administrator[0]?.ready ?? false
}, null, 2));
