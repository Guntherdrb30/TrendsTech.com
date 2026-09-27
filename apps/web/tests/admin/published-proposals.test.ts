import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { Prisma } from '@trends172tech/db';
import { registerPublishedProposals } from '../../app/lib/admin-ai/register-published-proposals';
import { presentationFromSummary, safePresentationUrl } from '../../app/lib/admin-ai/proposal-presentation';

function database() {
  const clients: any[] = [];
  const proposals: any[] = [];
  const logs = new Map();
  const tx = {
    $executeRaw: async () => 1,
    adminClient: {
      findMany: async ({where}: any) => clients.filter(c => where.OR.some((x: any) => c.name.toLowerCase() === x.name.equals.toLowerCase())),
      create: async ({data}: any) => { clients.push({...data}); return clients.at(-1); },
    },
    adminProposal: {
      findMany: async ({where}: any) => proposals.filter(p => p.clientId === where.clientId && where.OR.some((x: any) => x.id === p.id || (x.title && x.title.equals.toLowerCase() === p.title.toLowerCase()) || (x.summary && p.summary?.includes(x.summary.contains)))),
      create: async ({data}: any) => { proposals.push({...data}); return proposals.at(-1); },
      update: async ({where,data}: any) => { const p = proposals.find(p => p.id === where.id); Object.assign(p,data); return p; },
    },
    adminActivityLog: { upsert: async ({where,create}: any) => { if (!logs.has(where.id)) logs.set(where.id,create); return logs.get(where.id); } },
  } as unknown as Prisma.TransactionClient;
  return {tx,clients,proposals,logs};
}

test('registration is repeatable, links complete scopes, creates no fake FDE client', async () => {
  const db = database();
  await registerPublishedProposals(db.tx); await registerPublishedProposals(db.tx);
  assert.equal(db.clients.length,2); assert.equal(db.proposals.length,2); assert.equal(db.logs.size,2);
  for (const p of db.proposals) {
    assert.ok(p.summary.includes('RUTA DE IMPLEMENTACIÓN')); assert.ok(p.summary.includes('CONDICIONES'));
    assert.ok(presentationFromSummary(p.summary)); assert.equal(p.status,'DRAFT'); assert.equal(p.amount,0);
  }
});
test('reuses existing client and preserves negotiated data and summary', async () => {
  const db = database();
  db.clients.push({id:'existing-city',name:'CITY CENTER',email:'existing@example.test'});
  db.proposals.push({id:'existing-proposal',clientId:'existing-city',title:'LUNA para City Center Maracay',summary:'Condiciones acordadas existentes',status:'ACCEPTED',amount:5500,probability:100,sentAt:'2026-09-20'});
  await registerPublishedProposals(db.tx);
  assert.equal(db.clients.length,2); assert.equal(db.proposals.length,2);
  const p = db.proposals[0]; assert.equal(p.status,'ACCEPTED'); assert.equal(p.amount,5500); assert.equal(p.sentAt,'2026-09-20'); assert.ok(p.summary.includes('Condiciones acordadas existentes'));
});
test('ambiguous client matches stop before writes', async () => {
  const db = database(); db.clients.push({id:'a',name:'City Center'},{id:'b',name:'City Center Maracay'});
  await assert.rejects(registerPublishedProposals(db.tx), /Ambiguous client match/); assert.equal(db.proposals.length,0);
});
test('untrusted or executable links are never rendered as presentation actions', () => {
  for (const url of ['javascript:alert(1)','https://evil.test/es/propuestas/a','https://www.trends172tech.com.evil.test/es/propuestas/a','https://name:secret@www.trends172tech.com/es/propuestas/a','https://www.trends172tech.com/es/admin']) assert.equal(safePresentationUrl(url),null);
  assert.equal(presentationFromSummary('Notas sin enlace'),null);
});
