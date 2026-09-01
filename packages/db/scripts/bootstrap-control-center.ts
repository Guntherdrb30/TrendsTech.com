import { createHash, randomBytes } from 'node:crypto';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const apply = process.argv.includes('--apply');
const issueClient = process.argv.includes('--issue-client');

const catalog = [
  {
    key: 'luna',
    name: 'LUNA',
    description: 'Plataforma empresarial de ventas IA nativa.'
  },
  {
    key: 'luna-football',
    name: 'LUNA Fútbol',
    description: 'Producto independiente para organizaciones deportivas.'
  },
  {
    key: 'luna-medical',
    name: 'LUNA Medical',
    description: 'Producto independiente para operaciones médicas.'
  }
] as const;

function hashToken(token: string) {
  return createHash('sha256').update(token, 'utf8').digest('hex');
}

async function main() {
  if (!apply) {
    console.log(JSON.stringify({
      mode: 'dry-run',
      products: catalog.map(({ key, name }) => ({ key, name })),
      implementation: { key: 'luna.carpihogar', productKey: 'luna', kind: 'INTERNAL', status: 'SHADOW' },
      note: 'Run with --apply only against an approved staging database.'
    }, null, 2));
    return;
  }

  const products = new Map<string, { id: string }>();
  for (const product of catalog) {
    const record = await prisma.controlProduct.upsert({
      where: { key: product.key },
      update: { name: product.name, description: product.description },
      create: { ...product, status: 'ACTIVE' }
    });
    products.set(product.key, record);
  }

  const luna = products.get('luna');
  if (!luna) throw new Error('LUNA product bootstrap failed');
  const implementation = await prisma.controlImplementation.upsert({
    where: { key: 'luna.carpihogar' },
    update: {
      productId: luna.id,
      name: 'CarpiHogar',
      kind: 'INTERNAL',
      status: 'SHADOW',
      environment: 'production',
      shadowMode: true
    },
    create: {
      key: 'luna.carpihogar',
      productId: luna.id,
      name: 'CarpiHogar',
      kind: 'INTERNAL',
      status: 'SHADOW',
      environment: 'production',
      shadowMode: true,
      metadataJson: { classification: 'own-production-implementation', sellableProduct: false }
    }
  });

  let credential: { token: string; prefix: string } | undefined;
  if (issueClient) {
    const prefix = `carpi${randomBytes(4).toString('hex')}`;
    const token = `trc_${prefix}.${randomBytes(32).toString('base64url')}`;
    await prisma.controlServiceClient.create({
      data: {
        implementationId: implementation.id,
        name: 'CarpiHogar shadow connector',
        keyPrefix: prefix,
        secretHash: hashToken(token),
        scopes: ['agent-runs:write', 'usage:write']
      }
    });
    credential = { token, prefix };
  }

  console.log(JSON.stringify({
    mode: 'applied',
    implementationId: implementation.id,
    credential,
    warning: credential ? 'Store the token now; only its hash was persisted and it will not be shown again.' : undefined
  }, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
