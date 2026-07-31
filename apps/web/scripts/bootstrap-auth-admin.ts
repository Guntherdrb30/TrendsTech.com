import { randomUUID } from 'node:crypto';
import { hash, verify } from '@node-rs/argon2';
import { neon } from '@neondatabase/serverless';

async function main() {
const email = (process.env.AUTH_ADMIN_EMAIL || 'trends172tech@gmail.com').trim().toLowerCase();
const password = process.env.AUTH_ADMIN_PASSWORD || process.env.ROOT_PASSWORD;
const databaseUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DIRECT_URL or DATABASE_URL is required.');
}

if (!password || password.length < 12) {
  throw new Error('Set AUTH_ADMIN_PASSWORD or ROOT_PASSWORD to a strong password with at least 12 characters.');
}

const passwordHash = await hash(password, {
  algorithm: 2,
  memoryCost: 65_536,
  timeCost: 3,
  parallelism: 4,
  outputLen: 32
});

if (!(await verify(passwordHash, password))) {
  throw new Error('Unable to verify the generated password hash.');
}

const sql = neon(databaseUrl);
const result = await sql`
  WITH upserted_user AS (
    INSERT INTO "User" (
      "id",
      "tenantId",
      "email",
      "name",
      "emailVerified",
      "phone",
      "avatarUrl",
      "role",
      "passwordHash",
      "createdAt",
      "updatedAt"
    ) VALUES (
      ${randomUUID()},
      NULL,
      ${email},
      'Administrador Trends172 Tech',
      true,
      NULL,
      NULL,
      'ROOT',
      NULL,
      now(),
      now()
    )
    ON CONFLICT ("email") DO UPDATE SET
      "role" = 'ROOT',
      "emailVerified" = true,
      "passwordHash" = NULL,
      "updatedAt" = now()
    RETURNING "id", "email"
  ),
  upserted_account AS (
    INSERT INTO "AuthAccount" (
      "id",
      "accountId",
      "providerId",
      "userId",
      "password",
      "createdAt",
      "updatedAt"
    )
    SELECT
      ${randomUUID()},
      "id",
      'credential',
      "id",
      ${passwordHash},
      now(),
      now()
    FROM upserted_user
    ON CONFLICT ("providerId", "accountId") DO UPDATE SET
      "userId" = EXCLUDED."userId",
      "password" = EXCLUDED."password",
      "updatedAt" = now()
    RETURNING "userId"
  ),
  deleted_sessions AS (
    DELETE FROM "AuthSession"
    WHERE "userId" = (SELECT "id" FROM upserted_user)
    RETURNING "id"
  )
  SELECT
    (SELECT "email" FROM upserted_user) AS "email",
    (SELECT COUNT(*)::int FROM deleted_sessions) AS "revokedSessions",
    EXISTS (SELECT 1 FROM upserted_account) AS "credentialReady"
`;

const admin = result[0];
if (!admin?.credentialReady) {
  throw new Error('Administrator credential was not created.');
}

console.log(`Administrador de autenticación listo: ${admin.email}`);
console.log(`Sesiones anteriores revocadas: ${admin.revokedSessions ?? 0}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : 'Unable to bootstrap administrator.');
  process.exitCode = 1;
});
