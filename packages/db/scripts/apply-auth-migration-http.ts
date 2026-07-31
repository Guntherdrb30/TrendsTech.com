import { createHash, randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { neon } from '@neondatabase/serverless';

const migrationName = '20260721143000_better_auth_foundation';
const migrationUrl = new URL(`../prisma/migrations/${migrationName}/migration.sql`, import.meta.url);
const databaseUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DIRECT_URL or DATABASE_URL is required.');
}

const migrationSql = await readFile(fileURLToPath(migrationUrl), 'utf8');
const checksum = createHash('sha256').update(migrationSql).digest('hex');
const statements = migrationSql
  .split(';')
  .map((statement) => statement.trim())
  .filter(Boolean);

const sql = neon(databaseUrl);
const existing = await sql`
  SELECT EXISTS (
    SELECT 1
    FROM "_prisma_migrations"
    WHERE migration_name = ${migrationName}
      AND finished_at IS NOT NULL
      AND rolled_back_at IS NULL
  ) AS applied
`;

if (existing[0]?.applied) {
  console.log(`Migration ${migrationName} is already applied.`);
  process.exit(0);
}

const migrationId = randomUUID();
const queries = statements.map((statement) => sql.query(statement, []));
queries.push(sql`
  INSERT INTO "_prisma_migrations" (
    id,
    checksum,
    finished_at,
    migration_name,
    logs,
    rolled_back_at,
    started_at,
    applied_steps_count
  ) VALUES (
    ${migrationId},
    ${checksum},
    now(),
    ${migrationName},
    NULL,
    NULL,
    now(),
    1
  )
`);

await sql.transaction(queries, { isolationLevel: 'Serializable' });
console.log(`Migration ${migrationName} applied successfully over Neon HTTPS.`);
