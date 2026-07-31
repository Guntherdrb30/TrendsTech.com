import { PrismaClient } from '@prisma/client';

async function checkConnection(label: string, url: string | undefined) {
  if (!url) {
    console.error(`${label} database URL is missing.`);
    return false;
  }

  const client = new PrismaClient({ datasources: { db: { url } } });
  try {
    await client.$queryRaw`SELECT 1`;
    console.log(`${label} database connection is healthy.`);
    return true;
  } catch (error) {
    const details = error as { code?: string; message?: string };
    const firstUsefulLine = details.message
      ?.split('\n')
      .map((line) => line.trim())
      .find((line) => line && !line.includes('prisma.$queryRaw'));
    console.error(`${label} database connection failed.`, {
      code: details.code ?? 'UNKNOWN',
      message: firstUsefulLine ?? 'Unknown database error'
    });
    return false;
  } finally {
    await client.$disconnect();
  }
}

const pooledHealthy = await checkConnection('Pooled', process.env.DATABASE_URL);
const directHealthy = await checkConnection('Direct', process.env.DIRECT_URL);

if (!pooledHealthy || !directHealthy) {
  process.exitCode = 1;
}
