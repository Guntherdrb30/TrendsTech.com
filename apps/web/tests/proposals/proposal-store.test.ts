import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { PrismaClient } from '@prisma/client';
import { createProposalStore } from '../../app/lib/proposals/store-core';
import { decodeProposal, type ProposalDraft } from '../../app/lib/proposals/document';
import { example } from './fixture';

const { version, revision, visibility, ...fields } = example;
const draft: ProposalDraft = {...fields, slug:'test-prospect'};

function database() {
  let rows: any[] = [];
  let clients: any[] = [];
  let logs: any[] = [];
  let conflict = false;
  let failAudit = false;
  const tx = {
    $executeRaw: async () => 1,
    adminClient: {
      findMany: async ({where}: any) => clients.filter(c => c.name.toLowerCase() === where.name.equals.toLowerCase()),
      create: async ({data}: any) => { const c = {id:`client-${clients.length}`, ...data}; clients.push(c); return c; },
    },
    adminProposal: {
      findUnique: async ({where}: any) => rows.find(r => r.id === where.id) ?? null,
      findMany: async () => rows,
      create: async ({data}: any) => { if (rows.some(r=>r.id===data.id)) throw Error('Duplicate'); const r={...data,updatedAt:new Date()}; rows.push(r); return r; },
      updateMany: async ({where,data}: any) => {
        if (conflict) return {count:0};
        const r=rows.find(r=>r.id===where.id && r.summary===where.summary && (!where.updatedAt || r.updatedAt===where.updatedAt));
        if (!r) return {count:0}; Object.assign(r,data); return {count:1};
      },
    },
    adminActivityLog: {create: async ({data}: any) => { if(failAudit) throw Error('Audit failed'); logs.push(data); return data; }},
  };
  const db = {...tx, $transaction: async (fn: any) => {
    const snapshot=structuredClone({rows,clients,logs});
    try { return await fn(tx); } catch (e) { ({rows,clients,logs}=snapshot); throw e; }
  }} as unknown as PrismaClient;
  return {store:createProposalStore(db), rows:()=>rows, clients:()=>clients, logs:()=>logs, conflict:()=>{conflict=true;}, failAudit:()=>{failAudit=true;}};
}

test('draft persists in CRM, stays private and publishes only its reviewed revision', async () => {
  const db=database(), s=db.store;
  await s.createProposalDocument(draft,'root-1');
  assert.equal(await s.getProposalDocument(draft.slug,true),null);
  assert.equal((await s.listProposalDocuments())[0].url,null);
  await s.updateProposalDraft({...draft,headline:'Updated client-specific headline'},1,'root-1');
  await assert.rejects(s.publishProposalDocument(draft.slug,1,'root-1'),/changed/);
  assert.equal(await s.getProposalDocument(draft.slug,true),null);
  await s.publishProposalDocument(draft.slug,2,'root-1');
  const doc=await s.getProposalDocument(draft.slug,true);
  assert.equal(doc?.visibility,'published'); assert.equal(doc?.revision,3);
  assert.equal(doc?.lastApprovedBy,'root-1'); assert.ok(doc?.publishedAt);
  assert.equal(db.logs().length,3);
  await assert.rejects(s.updateProposalDraft(draft,3,'root-1'),/silently edited/);
  await assert.rejects(s.publishProposalDocument(draft.slug,3,'root-1'),/already published/);
  assert.equal(db.rows()[0].status,'DRAFT'); // publication is not commercial acceptance or sending
});

test('reserved pages, duplicate slugs, client changes and ambiguous clients are rejected', async () => {
  const db=database(),s=db.store;
  for (const slug of ['city-center-maracay','cima-barinas','big-home','fits-tools']) {
    await assert.rejects(s.createProposalDocument({...draft,slug},'root'),/separately maintained/);
  }
  await s.createProposalDocument(draft,'root');
  await assert.rejects(s.createProposalDocument(draft,'root'),/Duplicate/);
  assert.equal(db.clients().length,1); assert.equal(db.rows().length,1);
  await assert.rejects(s.updateProposalDraft({...draft,clientName:'Other client'},1,'root'),/identity/);
  db.clients().push({...db.clients()[0],id:'ambiguous'});
  await assert.rejects(s.createProposalDocument({...draft,slug:'other-prospect'},'root'),/Ambiguous/);
  assert.equal(db.rows().length,1);
});

test('lost updates and audit failures roll back publication', async () => {
  for (const failure of ['conflict','audit'] as const) {
    const db=database(); await db.store.createProposalDocument(draft,'root');
    failure==='conflict' ? db.conflict() : db.failAudit();
    await assert.rejects(db.store.publishProposalDocument(draft.slug,1,'root'), /Concurrent|Audit failed/);
    assert.equal(decodeProposal(db.rows()[0].summary)?.visibility,'draft');
    assert.equal(db.logs().length,1);
  }
});

test('updates preserve negotiated CRM fields and stale updates fail', async () => {
  const db=database(); await db.store.createProposalDocument(draft,'root');
  Object.assign(db.rows()[0],{amount:7000,status:'ACCEPTED',sentAt:'2026-10-01'});
  await db.store.updateProposalDraft({...draft,title:'Revised technical scope'},1,'root');
  await assert.rejects(db.store.updateProposalDraft(draft,1,'root'),/Revision conflict/);
  assert.equal(db.rows()[0].amount,7000); assert.equal(db.rows()[0].status,'ACCEPTED');
  assert.equal(db.rows()[0].sentAt,'2026-10-01');
});

test('a pre-existing CIMA document remains editable and publishable after template reservation', async () => {
  const db=database(); await db.store.createProposalDocument(draft,'root');
  const {encodeProposal}=await import('../../app/lib/proposals/document');
  const legacy={...draft,slug:'cima-barinas'};
  db.rows()[0].id='chatgpt-proposal-cima-barinas';
  db.rows()[0].summary=encodeProposal({...legacy,version:1,revision:1,visibility:'draft'});
  await db.store.updateProposalDraft({...legacy,title:'Existing CIMA CRM proposal'},1,'root');
  await db.store.publishProposalDocument(legacy.slug,2,'root');
  assert.equal((await db.store.getProposalDocument(legacy.slug,true))?.title,'Existing CIMA CRM proposal');
});
