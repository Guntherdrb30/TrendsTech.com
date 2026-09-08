import { requirePartner } from '@/lib/partners/access';
import { getPartnerEntries, getPartnerProjects } from '@/lib/partners/workspace-data';
import { addWorkspaceEntry } from '../actions';
import { EntryForm, EntryList, WorkspaceHeader } from '@/components/partner/workspace-ui';

export default async function ResearchPage({ params }: { params: Promise<{ locale: string }> }) { const { locale }=await params; const {partner}=await requirePartner(locale); const [projects,entries]=await Promise.all([getPartnerProjects(partner.id),getPartnerEntries(partner.id,['RESEARCH'])]); return <div className="space-y-6"><WorkspaceHeader eyebrow="Inteligencia empresarial" title="Investigación" description="Registra hallazgos sobre la empresa, su industria, competidores, tecnología, regulación y señales comerciales. Todo dato investigado conserva su fuente y proyecto."/><div className="grid gap-6 xl:grid-cols-[420px_1fr]"><EntryForm locale={locale} projects={projects} action={addWorkspaceEntry} category="RESEARCH" title="Nuevo hallazgo" fields="linked"/><EntryList locale={locale} entries={entries}/></div></div>; }
