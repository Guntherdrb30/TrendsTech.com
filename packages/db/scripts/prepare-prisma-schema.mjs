import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const schemaPath = path.resolve(here, '../prisma/schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf8');

const current = `enum UserRole {\n  ROOT\n  TENANT_ADMIN\n  TENANT_OPERATOR\n  TENANT_VIEWER\n}`;
const desired = `enum UserRole {\n  ROOT\n  TENANT_ADMIN\n  TENANT_OPERATOR\n  TENANT_VIEWER\n  PARTNER\n}`;

if (schema.includes(desired)) {
  console.log('[prisma] UserRole already includes PARTNER');
  process.exit(0);
}

if (!schema.includes(current)) {
  throw new Error('Could not locate the expected UserRole enum in prisma/schema.prisma');
}

schema = schema.replace(current, desired);
fs.writeFileSync(schemaPath, schema, 'utf8');
console.log('[prisma] Added PARTNER to UserRole before Prisma Client generation');
