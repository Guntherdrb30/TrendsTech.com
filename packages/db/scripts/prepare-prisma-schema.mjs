import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const schemaPath = path.resolve(here, '../prisma/schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf8');

const enumPattern = /enum\s+UserRole\s*\{([\s\S]*?)\}/m;
const match = schema.match(enumPattern);
if (!match) {
  throw new Error('Could not locate the UserRole enum in prisma/schema.prisma');
}

if (/^\s*PARTNER\s*$/m.test(match[1])) {
  console.log('[prisma] UserRole already includes PARTNER');
  process.exit(0);
}

const lineEnding = schema.includes('\r\n') ? '\r\n' : '\n';
const updatedEnum = match[0].replace(/\s*\}$/, `${lineEnding}  PARTNER${lineEnding}}`);
schema = schema.replace(match[0], updatedEnum);
fs.writeFileSync(schemaPath, schema, 'utf8');
console.log('[prisma] Added PARTNER to UserRole before Prisma Client generation');
