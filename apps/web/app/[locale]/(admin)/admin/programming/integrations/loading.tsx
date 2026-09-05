export default function LoadingStudioIntegrations() {
  return <div aria-label="Cargando proyectos de Vercel" className="space-y-5 animate-pulse">
    <div className="h-20 rounded-2xl bg-slate-100 dark:bg-slate-900"/>
    <div className="h-52 rounded-[26px] bg-slate-100 dark:bg-slate-900"/>
    <div className="grid gap-4 md:grid-cols-2"><div className="h-64 rounded-[24px] bg-slate-100 dark:bg-slate-900"/><div className="h-64 rounded-[24px] bg-slate-100 dark:bg-slate-900"/></div>
  </div>;
}
