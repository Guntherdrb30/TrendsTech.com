import { revalidatePath } from 'next/cache';
import { notFound } from 'next/navigation';
import { prisma } from '@trends172tech/db';
import { requirePartner } from '@/lib/partners/access';
import { runProjectAgent } from '@/lib/partners/project-agent';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type ProjectRow = { id: string; name: string; targetCompany: string; agentName: string | null; readinessScore: number };
type ChatRow = { id: string; category: string; content: string; createdAt: Date };

async function sendMessage(formData: FormData) {
  'use server';
  const locale = String(formData.get('locale') || 'es');
  const opportunityId = String(formData.get('opportunityId') || '');
  const message = String(formData.get('message') || '').trim();
  if (!opportunityId || !message || message.length > 6000) return;

  const { user, partner } = await requirePartner(locale);
  await runProjectAgent({ partnerId: partner.id, opportunityId, actorUserId: user.id, message });
  revalidatePath(`/${locale}/partner/projects/${opportunityId}`);
  revalidatePath(`/${locale}/partner/projects/${opportunityId}/agent`);
}

export default async function ProjectAgentPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  const { partner } = await requirePartner(locale);
  const rows = await prisma.$queryRaw<ProjectRow[]>`
    SELECT o."id", o."name", o."targetCompany", a."name" AS "agentName", COALESCE(m."readinessScore", 0) AS "readinessScore"
    FROM "PartnerOpportunity" o
    LEFT JOIN "ProjectAgent" a ON a."opportunityId" = o."id"
    LEFT JOIN "ProjectMemory" m ON m."opportunityId" = o."id"
    WHERE o."id" = ${id} AND o."partnerId" = ${partner.id}
    LIMIT 1
  `;
  const project = rows[0];
  if (!project) notFound();

  const chats = await prisma.$queryRaw<ChatRow[]>`
    SELECT "id", "category", "content", "createdAt"
    FROM "ProjectMemoryEntry"
    WHERE "opportunityId" = ${id} AND "isCurrent" = true AND "category" IN ('CHAT_USER','CHAT_AGENT')
    ORDER BY "createdAt" ASC
    LIMIT 80
  `;
  const enabled = process.env.PARTNER_AGENT_API_ENABLED === 'true';

  return <div className="mx-auto max-w-5xl space-y-6">
    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-red-600">Project Agent · memoria persistente</p><h2 className="mt-1 text-3xl font-semibold tracking-tight">{project.agentName || project.name}</h2><p className="mt-2 text-sm text-slate-500">{project.targetCompany} · preparación {project.readinessScore}%</p></div>
      <a className="text-sm font-semibold text-red-600" href={`/${locale}/partner/projects/${id}`}>Volver al expediente</a>
    </div>

    {!enabled && <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><strong>IA preparada pero deshabilitada.</strong> La interfaz, aislamiento por proyecto y persistencia están conectados. Para evitar consumo accidental de API, el administrador debe habilitar <code>PARTNER_AGENT_API_ENABLED=true</code>.</div>}

    <Card><CardHeader><CardTitle>Conversación del proyecto</CardTitle></CardHeader><CardContent>
      <div className="min-h-[360px] space-y-4 rounded-xl border bg-slate-50 p-4">
        {chats.length === 0 ? <div className="flex min-h-[320px] items-center justify-center text-center"><div><p className="font-semibold">Este agente conoce únicamente este expediente.</p><p className="mt-2 max-w-lg text-sm text-slate-500">Puedes pedirle que evalúe qué falta, prepare el levantamiento, analice una reunión, organice requisitos, proponga próximos pasos o determine si ya existe información suficiente para una propuesta preliminar.</p></div></div> : chats.map((chat) => <div key={chat.id} className={chat.category === 'CHAT_USER' ? 'ml-auto max-w-[82%] rounded-2xl bg-slate-900 p-4 text-sm text-white' : 'mr-auto max-w-[88%] rounded-2xl border bg-white p-4 text-sm text-slate-800'}><p className="whitespace-pre-wrap">{chat.content}</p></div>)}
      </div>
      <form action={sendMessage} className="mt-4 space-y-3">
        <input type="hidden" name="locale" value={locale}/><input type="hidden" name="opportunityId" value={id}/>
        <textarea name="message" required maxLength={6000} rows={5} placeholder="Ej.: Acabamos de salir de la primera reunión. Nos indicaron que usan LuloWin y que el proceso de APU se revisa manualmente. ¿Qué debemos levantar en la segunda reunión?" className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-red-500"/>
        <div className="flex items-center justify-between gap-3"><p className="text-xs text-slate-500">La información útil aportada aquí puede incorporarse a la memoria del proyecto con su fuente y nivel de confianza.</p><Button type="submit" disabled={!enabled}>Enviar al agente</Button></div>
      </form>
    </CardContent></Card>
  </div>;
}
