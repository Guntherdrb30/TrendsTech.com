import { neon } from '@neondatabase/serverless';

const databaseUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DIRECT_URL or DATABASE_URL is required.');
}

try {
  const sql = neon(databaseUrl);
  await sql`SELECT 1 AS healthy`;
  console.log('Neon HTTPS database connection is healthy.');
} catch (error) {
  const details = error as { code?: string; message?: string };
  console.error('Neon HTTPS database connection failed.', {
    code: details.code ?? 'UNKNOWN',
    message: details.message?.split('\n')[0] ?? 'Unknown database error'
  });
  process.exitCode = 1;
}
