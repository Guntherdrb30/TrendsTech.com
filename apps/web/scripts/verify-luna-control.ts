import { writeFile } from 'node:fs/promises';
/** Local integration test only. Never accepts an external database or writes real users. */
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../app/lib/auth/password';
const url = new URL(process.env.DATABASE_URL ?? '');
const base = process.env.LUNA_TEST_BASE_URL ?? 'http://127.0.0.1:3000';
if (!['127.0.0.1','localhost'].includes(url.hostname) || !['127.0.0.1','localhost'].includes(new URL(base).hostname)) throw new Error('Local isolated database and server required');
const db = new PrismaClient();
const suffix = randomUUID().slice(0,8);
const password = `Fixture-${randomUUID()}`;
async function request(path: string, method='GET', body?: object, cookie?: string, token?: string, origin=base) {
 const response = await fetch(`${base}/api/luna-ai-control/${path}`, { method, headers: { origin, ...(cookie ? { cookie } : {}), ...(token ? { authorization: `Bearer ${token}` } : {}), ...(body ? { 'content-type':'application/json' } : {}) }, body: body ? JSON.stringify(body) : undefined });
 return { status: response.status, body: await response.json() };
}
async function login(email: string) {
 const response = await fetch(`${base}/api/auth/sign-in/email`, { method:'POST', headers:{ origin:base,'content-type':'application/json' }, body: JSON.stringify({email,password}) });
 assert.equal(response.status,200,await response.text());
 return response.headers.getSetCookie().map(c => c.split(';')[0]).join('; ');
}
async function main() {
try {
 const tenantA = await db.tenant.create({data:{name:'Isolated fixture A',slug:`fixture-a-${suffix}`}});
 const tenantB = await db.tenant.create({data:{name:'Isolated fixture B',slug:`fixture-b-${suffix}`}});
 const users: string[]=[];
 for (const [role,tenantId] of [['ROOT',null],['TENANT_ADMIN',tenantA.id],['TENANT_VIEWER',tenantB.id]] as const) {
  const email=`${role.toLowerCase()}-${suffix}@example.test`;
  const u=await db.user.create({data:{email,name:'LUNA local fixture',role,tenantId,emailVerified:true}});
  await db.authAccount.create({data:{accountId:u.id,providerId:'credential',userId:u.id,password:await hashPassword(password)}});
  users.push(email);
 }
 await db.$disconnect();
 const root=await login(users[0]), admin=await login(users[1]), viewer=await login(users[2]);
 assert.equal((await request('installations')).status,401);
 assert.equal((await request('activity','GET',undefined,admin)).status,403);
 assert.equal((await request('installations','POST',{name:'Forbidden',applicationKey:'test-app',tenantId:tenantB.id},admin)).status,403);
 assert.equal((await request('installations','POST',{name:'Forbidden',applicationKey:'test-app'},viewer)).status,403);
 const created=await request('installations','POST',{name:'Local verified installation',applicationKey:'fixture-app',environment:'preview',tenantId:tenantA.id},root);
 assert.equal(created.status,201,JSON.stringify(created.body)); const id=created.body.data.id;
 assert.equal((await request(`installations/${id}/transition`,'POST',{action:'approve'},admin)).status,403);
 assert.equal((await request(`installations/${id}/transition`,'POST',{action:'approve'},root,undefined,'https://evil.example')).status,403);
 assert.equal((await request(`installations/${id}/credentials`,'POST',{},root)).status,409);
 assert.equal((await request(`installations/${id}/transition`,'POST',{action:'approve'},root)).status,200);
 const issued=await request(`installations/${id}/credentials`,'POST',{},root); assert.equal(issued.status,201);const token=issued.body.credential;
 assert.equal((await request('connection','GET',undefined,undefined,token)).status,401);
 assert.equal((await request(`installations/${id}/transition`,'POST',{action:'activate'},root)).status,200);
 assert.equal((await request('connection','GET',undefined,undefined,token)).status,200);
 assert.equal((await request('gateway/reserve','POST',{agent:'assistant',operationId:'unconfigured'},undefined,token)).status,403);
 assert.equal((await request(`installations/${id}/policy`,'POST',{enabled:true,allowedAgents:['assistant'],requestsPerMinute:2,maxConcurrent:1},root)).status,200);
 assert.equal((await request('gateway/reserve','POST',{agent:'unknown',operationId:'denied'},undefined,token)).status,403);
 const lease=await request('gateway/reserve','POST',{agent:'assistant',operationId:'op-a'},undefined,token);assert.equal(lease.status,200,JSON.stringify(lease.body));
 assert.equal((await request('gateway/reserve','POST',{agent:'assistant',operationId:'op-b'},undefined,token)).status,429);
 assert.equal((await request('gateway/release','POST',{leaseId:lease.body.leaseId},undefined,token)).status,200);
 assert.equal((await request('gateway/reserve','POST',{agent:'assistant',operationId:'op-a'},undefined,token)).status,409);
 const secondLease=await request('gateway/reserve','POST',{agent:'assistant',operationId:'op-b'},undefined,token); assert.equal(secondLease.status,200);
 assert.equal((await request('gateway/release','POST',{leaseId:secondLease.body.leaseId},undefined,token)).status,200);
 assert.equal((await request('gateway/reserve','POST',{agent:'assistant',operationId:'op-c'},undefined,token)).status,429);
 const started=new Date().toISOString();const event={operationId:'usage-1',platform:'fixture',module:'api_call',action:'verify',provider:'fixture',environment:'test',startedAt:started,completedAt:started,durationMs:0,status:'success'};
 const accepted=await request('usage','POST',event,undefined,token);assert.equal(accepted.status,202,JSON.stringify(accepted.body)); assert.equal(accepted.body.accepted,true);
 assert.equal((await request('usage','POST',event,undefined,token)).body.duplicate,true);
 assert.equal((await request('usage','POST',{...event,inputTokens:2147483648},undefined,token)).status,400);
 const otherList=await request('installations','GET',undefined,viewer);assert.equal(otherList.body.data.some((i:{id:string})=>i.id===id),false);
 const activity=await request('activity','GET',undefined,root);assert.equal(activity.status,200);assert.equal(activity.body.recent.some((e:{installationId:string})=>e.installationId===id),true);
 assert.equal(await db.aiControlInstallationAudit.count({where:{installationId:id}})>=5,true);
 assert.equal((await request(`installations/${id}/transition`,'POST',{action:'suspend',reason:'fixture verification'},root)).status,200);
 assert.equal((await request('connection','GET',undefined,undefined,token)).status,401);
 assert.equal((await request('gateway/reserve','POST',{agent:'assistant',operationId:'suspended'},undefined,token)).status,401);
 assert.equal((await request(`installations/${id}/transition`,'POST',{action:'resume'},root)).status,200);
 const credential=await db.aiControlCredential.findFirstOrThrow({where:{installationId:id}});
 assert.equal((await request(`installations/${id}/credentials/${credential.id}/revoke`,'POST',{},root)).status,200);
 assert.equal((await request('connection','GET',undefined,undefined,token)).status,401);
 if (process.env.LUNA_TEST_BROWSER_STATE) await writeFile(process.env.LUNA_TEST_BROWSER_STATE, JSON.stringify({ cookie: root, base }), { mode: 0o600 });
 console.log('PASS: real login, ROOT gates, CSRF, tenant isolation, lifecycle, credential revocation, gateway access/concurrency/replay, telemetry idempotency and history.');
} finally { await db.$disconnect(); }

}
main().catch(error => { console.error(error); process.exitCode = 1; });
