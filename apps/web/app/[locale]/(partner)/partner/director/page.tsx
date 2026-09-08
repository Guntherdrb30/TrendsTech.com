import Link from 'next/link';
import { requirePartner } from '@/lib/partners/access';
import { getPartnerProjects } from '@/lib/partners/workspace-data';
import { WorkspaceHeader } from '@/components/partner/workspace-ui';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default async function DirectorPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params; const { partner } = await requirePartner(locale); const projects = await getPartnerProjects(partner.id);
  return <div className="space-y-6"><WorkspaceHeader eyebrow="Business Discovery Agent" title="Director B2B" description="Selecciona una oportunidad para conversar con su agente especializado. Cada conversación usa únicamente la memoria de ese proyecto y mantiene separados hechos, supuestos, preguntas, riesgos y próximas acciones."/>
    <div className="grid gap-4 md:grid-cols-2">{projects.length ? projects.map(p=><Card key={p.id}><CardHeader><CardTitle>{p.name}</CardTitle></CardHeader><CardContent><p className="mb-4 text-sm text-slate-500">{p.targetCompany}</p><Button asChild className="w-full"><Link href={`/${locale}/partner/projects/${p.id}/agent`}>Abrir Director B2B del proyecto</Link></Button></CardContent></Card>) : <Card><CardContent className="pt-6 text-sm text-slate-500">Crea primero una oportunidad para activar su expediente y agente independiente.</CardContent></Card>}</div>
  </div>;
}
