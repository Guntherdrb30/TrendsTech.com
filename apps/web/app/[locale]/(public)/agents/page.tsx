import { getTranslations } from 'next-intl/server';

export default async function AgentsPage() {
  const t = await getTranslations('pages');
  const common = await getTranslations('common');

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">{t('agentsTitle')}</h1>
      <div className="rounded border border-dashed border-slate-300 px-4 py-6 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
        {common('comingSoon')}
      </div>
    </section>
  );
}
