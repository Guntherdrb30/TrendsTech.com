import { randomBytes } from 'crypto';
import bcryptjs from 'bcryptjs';
import { Prisma, PrismaClient, RoundingRule, TenantMode, TenantStatus, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

function generatePassword() {
  return randomBytes(8).toString('hex');
}

async function main() {
  const rootEmail = process.env.ROOT_EMAIL ?? 'root@trends172tech.local';
  const rootPassword = process.env.ROOT_PASSWORD ?? generatePassword();
  const demoEmail = process.env.DEMO_EMAIL ?? 'admin@demo.trends172tech.local';
  const demoPassword = process.env.DEMO_PASSWORD ?? 'Demo123!';

  const rootHash = await bcryptjs.hash(rootPassword, 10);
  const demoHash = await bcryptjs.hash(demoPassword, 10);

  const rootUser = await prisma.user.upsert({
    where: { email: rootEmail },
    update: {
      role: UserRole.ROOT,
      passwordHash: rootHash
    },
    create: {
      email: rootEmail,
      name: 'Root Admin',
      role: UserRole.ROOT,
      passwordHash: rootHash
    }
  });

  await prisma.globalSettings.upsert({
    where: { id: 1 },
    update: {
      usdToVesRate: new Prisma.Decimal('36.5'),
      roundingRule: RoundingRule.ONE,
      usdPaymentDiscountPercent: new Prisma.Decimal('5.0'),
      tokenInputUsdPer1M: new Prisma.Decimal('0.40'),
      tokenOutputUsdPer1M: new Prisma.Decimal('1.60'),
      tokenCachedInputUsdPer1M: new Prisma.Decimal('0.10'),
      tokenMarkupPercent: new Prisma.Decimal('30.0'),
      updatedByUserId: rootUser.id
    },
    create: {
      id: 1,
      usdToVesRate: new Prisma.Decimal('36.5'),
      roundingRule: RoundingRule.ONE,
      usdPaymentDiscountPercent: new Prisma.Decimal('5.0'),
      tokenInputUsdPer1M: new Prisma.Decimal('0.40'),
      tokenOutputUsdPer1M: new Prisma.Decimal('1.60'),
      tokenCachedInputUsdPer1M: new Prisma.Decimal('0.10'),
      tokenMarkupPercent: new Prisma.Decimal('30.0'),
      updatedByUserId: rootUser.id
    }
  });

  await prisma.plan.upsert({
    where: { key: 'starter' },
    update: {
      name_es: 'Starter',
      name_en: 'Starter',
      priceUsdMonthly: new Prisma.Decimal('49.00'),
      isActive: true
    },
    create: {
      key: 'starter',
      name_es: 'Starter',
      name_en: 'Starter',
      priceUsdMonthly: new Prisma.Decimal('49.00'),
      isActive: true
    }
  });

  const demoTenant = await prisma.tenant.upsert({
    where: { slug: 'demo' },
    update: {
      name: 'Demo Tenant',
      mode: TenantMode.SINGLE,
      status: TenantStatus.ACTIVE
    },
    create: {
      name: 'Demo Tenant',
      slug: 'demo',
      mode: TenantMode.SINGLE,
      status: TenantStatus.ACTIVE
    }
  });

  await prisma.tokenWallet.upsert({
    where: { tenantId: demoTenant.id },
    update: {},
    create: {
      tenantId: demoTenant.id,
      balance: 0
    }
  });

  const existingCreator = await prisma.agentInstance.findFirst({
    where: { tenantId: demoTenant.id, baseAgentKey: 'agent_creator' }
  });
  if (!existingCreator) {
    await prisma.agentInstance.create({
      data: {
        tenantId: demoTenant.id,
        name: 'Creador de agentes',
        baseAgentKey: 'agent_creator',
        languageDefault: 'ES',
        status: 'ACTIVE'
      }
    });
  }

  await prisma.user.upsert({
    where: { email: demoEmail },
    update: {
      role: UserRole.TENANT_ADMIN,
      tenantId: demoTenant.id,
      passwordHash: demoHash
    },
    create: {
      email: demoEmail,
      name: 'Demo Admin',
      role: UserRole.TENANT_ADMIN,
      tenantId: demoTenant.id,
      passwordHash: demoHash
    }
  });

  console.log('Seed complete.');
  console.log(`ROOT_EMAIL=${rootEmail}`);
  console.log(`ROOT_PASSWORD=${rootPassword}`);
  console.log(`DEMO_EMAIL=${demoEmail}`);
  console.log(`DEMO_PASSWORD=${demoPassword}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
