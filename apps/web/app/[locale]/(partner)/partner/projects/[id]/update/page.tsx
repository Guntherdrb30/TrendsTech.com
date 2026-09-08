import { randomUUID } from 'node:crypto';
import Link from 'next/link';
import { revalidatePath } from 'next/cache';
import { notFound, redirect } from 'next/navigation';
import { prisma } from '@trends172tech/db';
import { requirePartner } from '@/lib/partners/access';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

type ProjectRow = {
  id: string;
  name: string;
  targetCompany: string;
  stage: string;
};

const allowedCategories = new Set([
  'FACT',
  'DECISION',
  'REQUIREMENT',
  'OPEN_QUESTION',
  'RISK',
  'NEXT_ACTION',
  'MEETING_NOTE'
]);

const allowedConfidence = new Set(['CONFIRMED', 'RESEARCHED', 'INFERRED', 'WORKING_ASSUMPTION']);

async function addProgress(formData: FormData) {
  'use server';
  const locale = String(formData.get('locale') || 'es');
  const opportunityId = String(formData.get('opportunityId') || '');
  const category = String(formData.get('category') || 'MEETING_NOTE');
  const confidence = String(formData.get('confidence') || 'CONFIRMED');
  const content = String(formData.get('content') || '').trim();
  const sourceLabel = String(formData.get('sourceLabel') || '').trim();

  if (!opportunityId || !content || content.length > 8000) return;
  if (!allowedCategories.has(category) || !allowedConfidence.has(confidence)) return;

  const { partner } = await requirePartner(locale);
  const project = await prisma.$queryRaw<Array<{ id: string }>>`
    SELECT "id" FROM "PartnerOpportunity"
    WHERE "id" = ${opportunityId} AND "partnerId" = ${partner.id}
    LIMIT 1
  `;
  if (!project[0]) notFound();

  await prisma.$executeRaw`
    INSERT INTO "ProjectMemoryEntry"
      ("id","opportunityId","category","content","sourceType","sourceLabel","confidence","isCurrent","createdAt")
    VALUES
      (${randomUUID()}, ${opportunityId}, ${category}, ${content}, 'ALLY_INPUT', ${sourceLabel || 'Actualización manual del aliado'}, ${confidence}, true, NOW())
  `;

  await prisma.$executeRaw`
    UPDATE "ProjectMemory"
    SET "updatedAt" = NOW()
    WHERE "opportunityId" = ${opportunityId}
  `;

  revalidatePath(`/${locale}/partner/projects/${opportunityId}`);
  redirect(`/${locale}/partner/projects/${opportunityId}`);
}

export default async function ProjectUpdatePage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  const { partner } = await requirePartner(locale);

  const rows = await prisma.$queryRaw<ProjectRow[]>`
    SELECT "id", "name", "targetCompany", "stage"
    FROM "PartnerOpportunity"
    WHERE "id" = ${id} AND "partnerId" = ${partner.id}
    LIMIT 1
  `;
  const project = rows[0];
  if (!project) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link href={`/${locale}/partner/projects/${id}`} className="text-sm font-semibold text-[#00aeb3]">← Volver al expediente</Link>
        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-[#00aeb3]">Actualizar memoria del proyecto</p>
        <h2 className="mt-1 text-3xl font-semibold tracking-tight">{project.name}</h2>
        <p className="mt-2 text-sm text-slate-500">{project.targetCompany} · {project.stage}</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Registrar avance</CardTitle></CardHeader>
        <CardContent>
          <form action={addProgress} className="space-y-5">
            <input type="hidden" name="locale" value={locale} />
            <input type="hidden" name="opportunityId" value={id} />

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="category">Tipo de información</Label>
                <select id="category" name="category" defaultValue="MEETING_NOTE" className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-950">
                  <option value="MEETING_NOTE">Nota de reunión / avance</option>
                  <option value="FACT">Hecho confirmado</option>
                  <option value="DECISION">Decisión</option>
                  <option value="REQUIREMENT">Requerimiento</option>
                  <option value="OPEN_QUESTION">Pregunta abierta</option>
                  <option value="RISK">Riesgo</option>
                  <option value="NEXT_ACTION">Próxima acción</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confidence">Nivel de confianza</Label>
                <select id="confidence" name="confidence" defaultValue="CONFIRMED" className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-950">
                  <option value="CONFIRMED">Confirmado</option>
                  <option value="RESEARCHED">Investigado</option>
                  <option value="INFERRED">Inferido</option>
                  <option value="WORKING_ASSUMPTION">Supuesto de trabajo</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sourceLabel">Fuente</Label>
              <input id="sourceLabel" name="sourceLabel" placeholder="Ej.: Reunión 08/09/2026, correo del cliente, llamada con Zuleima" className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-800 dark:bg-slate-950" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Información nueva</Label>
              <textarea id="content" name="content" rows={10} maxLength={8000} required placeholder="Registra lo que cambió o lo que se confirmó. Esta información se incorporará al expediente y estará disponible para el Project Agent en futuras conversaciones." className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#00c7ca] dark:border-slate-800 dark:bg-slate-950" />
            </div>

            <div className="flex items-center justify-end gap-3">
              <Button type="button" variant="outline" asChild><Link href={`/${locale}/partner/projects/${id}`}>Cancelar</Link></Button>
              <Button type="submit">Guardar en memoria</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
