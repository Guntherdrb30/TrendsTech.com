import test from 'node:test';
import assert from 'node:assert/strict';
import { issueInstallationCredential, hashInstallationCredential, verifyInstallationCredential } from '../../app/lib/luna-ai-control/credentials';
import { assertSameOrigin } from '../../app/lib/luna-ai-control/access';

test('credentials have 256-bit random material, hashed storage and fail closed validation', () => {
 const a = issueInstallationCredential(), b = issueInstallationCredential();
 assert.match(a.secret, /^luna_live_[A-Za-z0-9_-]{43}$/);
 assert.notEqual(a.secret,b.secret); assert.equal(a.hash,hashInstallationCredential(a.secret));
 assert.equal(verifyInstallationCredential(a.secret,a.hash),true);
 for (const secret of ['', 'wrong', b.secret]) assert.equal(verifyInstallationCredential(secret,a.hash),false);
 assert.equal(verifyInstallationCredential(a.secret,'not-a-hash'),false);
});

test('cookie mutations reject absent, cross origin and misleading Fetch Metadata', () => {
 const url='https://preview.example/api/luna-ai-control/installations';
 assert.doesNotThrow(() => assertSameOrigin(new Request(url,{headers:{origin:'https://preview.example'}})));
 for (const headers of [{}, {origin:'https://evil.example'}, {origin:'https://preview.example','sec-fetch-site':'cross-site'}]) {
   assert.throws(() => assertSameOrigin(new Request(url,{headers})), /Same-origin/);
 }
});

test('preview mutations accept the configured stable alias and deployment URL only', () => {
 const original = { env:process.env.VERCEL_ENV, url:process.env.VERCEL_URL, auth:process.env.BETTER_AUTH_URL };
 try {
  process.env.VERCEL_ENV='preview'; process.env.VERCEL_URL='immutable.vercel.app'; process.env.BETTER_AUTH_URL='https://stable.vercel.app';
  for (const origin of ['https://stable.vercel.app','https://immutable.vercel.app']) {
   assert.doesNotThrow(() => assertSameOrigin(new Request(`${origin}/api/test`,{headers:{origin}})));
  }
  for (const origin of ['https://foreign.vercel.app','https://stable.vercel.app.evil.example']) {
   assert.throws(() => assertSameOrigin(new Request('https://stable.vercel.app/api/test',{headers:{origin}})),/Same-origin/);
  }
  assert.throws(() => assertSameOrigin(new Request('https://stable.vercel.app/api/test',{headers:{origin:'https://stable.vercel.app','sec-fetch-site':'cross-site'}})),/Same-origin/);
 } finally {
  for (const [key,value] of Object.entries({VERCEL_ENV:original.env,VERCEL_URL:original.url,BETTER_AUTH_URL:original.auth})) {
   if (value === undefined) delete process.env[key]; else process.env[key]=value;
  }
 }
});

test('deployed previews are blocked until database isolation is explicitly verified', async () => {
 const { assertControlPreviewReady } = await import('../../app/lib/luna-ai-control/preview-isolation');
 const original = { env: process.env.VERCEL_ENV, url: process.env.VERCEL_URL, ready: process.env.LUNA_CONTROL_PREVIEW_DATABASE_ISOLATED };
 try {
  process.env.VERCEL_ENV='preview'; process.env.VERCEL_URL='preview.vercel.app'; delete process.env.LUNA_CONTROL_PREVIEW_DATABASE_ISOLATED;
  assert.throws(assertControlPreviewReady,/isolated database/);
  process.env.LUNA_CONTROL_PREVIEW_DATABASE_ISOLATED='true'; assert.doesNotThrow(assertControlPreviewReady);
 } finally {
  for (const [key,value] of Object.entries({VERCEL_ENV:original.env,VERCEL_URL:original.url,LUNA_CONTROL_PREVIEW_DATABASE_ISOLATED:original.ready})) {
   if (value === undefined) delete process.env[key]; else process.env[key]=value;
  }
 }
});
