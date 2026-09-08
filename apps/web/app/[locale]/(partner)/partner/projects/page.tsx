import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import Link from 'next/link';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@trends172tech/db';
import { requirePartner } from '@/lib/partners/access';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type OpportunityRow = { id:string; name:string; targetCompany:string; stage:string; status:string; readinessScore:number; createdAt:Date };
const createSchema=z.object({locale:z.string().min(1),name:z.string().min(3).max(180),targetCompany:z.string().min(2).max(180),clientContact:z.string().max(180).optional(),stage:z.enum(['FIRST_APPROACH','DISCOVERY','SECOND_MEETING','TECHNICAL_PROPOSAL','NEGOTIATION']),objective:z.string().max(2000).optional(),knownContext:z.string().max(6000).optional(),requestedNeed:z.string().max(4000).optional()});

async function createOpportunity(formData:FormData){
  'use server';
  const parsed=createSchema.safeParse({locale:formData.get('locale'),name:formData.get('name'),targetCompany:formData.get('targetCompany'),clientContact:formData.get('clientContact')||undefined,stage:formData.get('stage'),objective:formData.get('objective')||undefined,knownContext:formData.get('knownContext')||undefined,requestedNeed:formData.get('requestedNeed')||undefined});
  if(!parsed.success)throw new Error('Datos de oportunidad inválidos.');
  const {partner}=await requirePartner(parsed.data.locale);
  const opportunityId=randomUUID();
  await prisma.$transaction(async(tx)=>{
    await tx.$executeRaw`INSERT INTO "PartnerOpportunity" ("id","partnerId","name","targetCompany","clientContact","stage","objective","knownContext","requestedNeed","status","createdAt","updatedAt") VALUES (${opportunityId},${partner.id},${parsed.data.name.trim()},${parsed.data.targetCompany.trim()},${parsed.data.clientContact?.trim()||null},${parsed.data.stage},${parsed.data.objective?.trim()||null},${parsed.data.knownContext?.trim()||null},${parsed.data.requestedNeed?.trim()||null},'ACTIVE',NOW(),NOW())`;
    await tx.$executeRaw`INSERT INTO "ProjectAgent" ("id","opportunityId","name","status","systemPromptVersion","createdAt","updatedAt") VALUES (${randomUUID()},${opportunityId},${`Agente · ${parsed.data.name.trim()}`},'ACTIVE','v1',NOW(),NOW())`;
    await tx.$executeRaw`INSERT INTO "ProjectMemory" ("id","opportunityId","executiveSummary","currentStageSummary","readinessScore","updatedAt") VALUES (${randomUUID()},${opportunityId},${parsed.data.knownContext?.trim()||null},${`Etapa inicial: ${parsed.data.stage}`},10,NOW())`;
    if(parsed.data.knownContext?.trim())await tx.$executeRaw`INSERT INTO "ProjectMemoryEntry" ("id","opportunityId","category","content","sourceType","sourceLabel","confidence","isCurrent","createdAt") VALUES (${randomUUID()},${opportunityId},'CONTEXT',${parsed.data.knownContext.trim()},'ALLY_INPUT','Contexto inicial del aliado','CONFIRMED',true,NOW())`;
    if(parsed.data.requestedNeed?.trim())await tx.$executeRaw`INSERT INTO "ProjectMemoryEntry" ("id","opportunityId","category","content","sourceType","sourceLabel","confidence","isCurrent","createdAt") VALUES (${randomUUID()},${opportunityId},'NEED',${parsed.data.requestedNeed.trim()},'ALLY_INPUT','Necesidad inicial','CONFIRMED',true,NOW())`;
  });
  revalidatePath(`/${parsed.data.locale}/partner/projects`);
  redirect(`/${parsed.data.locale}/partner/projects/${opportunityId}`);
}

export default async function PartnerProjectsPage({params}:{params:Promise<{locale:string}>}){
  const {locale}=await params;
  const {partner}=await requirePartner(locale);
  const opportunities=await prisma.$queryRaw<OpportunityRow[]>`SELECT o."id",o."name",o."targetCompany",o."stage",o."status",COALESCE(m."readinessScore",0) AS "readinessScore",o."createdAt" FROM "PartnerOpportunity" o LEFT JOIN "ProjectMemory" m ON m."opportunityId"=o."id" WHERE o."partnerId"=${partner.id} ORDER BY o."createdAt" DESC`;
  return <div className="space-y-6"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-red-600">Pipeline</p><h2 className="mt-1 text-3xl font-semibold tracking-tight">Proyectos y oportunidades</h2><p className="mt-2 text-sm text-slate-500">Cada oportunidad crea automáticamente un agente y una memoria persistente independiente.</p></div><div className="grid gap-6 xl:grid-cols-[430px_1fr]"><Card><CardHeader><CardTitle>Nueva oportunidad</CardTitle></CardHeader><CardContent><form action={createOpportunity} className="space-y-4"><input type="hidden" name="locale" value={locale}/><div className="space-y-2"><Label htmlFor="name">Nombre del proyecto</Label><Input id="name" name="name" required/></div><div className="space-y-2"><Label htmlFor="targetCompany">Empresa objetivo</Label><Input id="targetCompany" name="targetCompany" required/></div><div className="space-y-2"><Label htmlFor="clientContact">Contacto</Label><Input id="clientContact" name="clientContact"/></div><div className="space-y-2"><Label htmlFor="stage">Etapa</Label><select id="stage" name="stage" defaultValue="DISCOVERY" className="w-full rounded-md border px-3 py-2 text-sm"><option value="FIRST_APPROACH">Primer acercamiento</option><option value="DISCOVERY">Levantamiento</option><option value="SECOND_MEETING">Segunda reunión</option><option value="TECHNICAL_PROPOSAL">Propuesta técnica</option><option value="NEGOTIATION">Negociación</option></select></div><div className="space-y-2"><Label>Objetivo</Label><textarea name="objective" rows={3} className="w-full rounded-md border px-3 py-2 text-sm"/></div><div className="space-y-2"><Label>Qué sabemos</Label><textarea name="knownContext" rows={5} className="w-full rounded-md border px-3 py-2 text-sm"/></div><div className="space-y-2"><Label>Necesidad</Label><textarea name="requestedNeed" rows={4} className="w-full rounded-md border px-3 py-2 text-sm"/></div><Button className="w-full">Crear oportunidad y agente</Button></form></CardContent></Card><Card><CardHeader><CardTitle>Oportunidades activas</CardTitle></CardHeader><CardContent><Table><TableHeader><TableRow><TableHead>Proyecto</TableHead><TableHead>Empresa</TableHead><TableHead>Etapa</TableHead><TableHead>Preparación</TableHead><TableHead/></TableRow></TableHeader><TableBody>{opportunities.length===0?<TableRow><TableCell colSpan={5} className="py-8 text-center">No hay oportunidades todavía.</TableCell></TableRow>:opportunities.map(o=><TableRow key={o.id}><TableCell className="font-medium">{o.name}</TableCell><TableCell>{o.targetCompany}</TableCell><TableCell>{o.stage}</TableCell><TableCell>{o.readinessScore}%</TableCell><TableCell><Link className="font-semibold text-red-600" href={`/${locale}/partner/projects/${o.id}`}>Abrir</Link></TableCell></TableRow>)}</TableBody></Table></CardContent></Card></div></div>;
}
