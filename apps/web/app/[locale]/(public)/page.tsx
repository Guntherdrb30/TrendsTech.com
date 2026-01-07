import { getTranslations } from 'next-intl/server';
import { PublicHomeClient } from './public-home-client';

export default async function HomePage() {
  const t = await getTranslations('pages');
  const common = await getTranslations('common');

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold sm:text-3xl">{t('homeTitle')}</h1>
      <p className="max-w-2xl text-base text-slate-600 dark:text-slate-300">
        {t('homeSubtitle')}
      </p>
      <div className="rounded border border-dashed border-slate-300 px-4 py-6 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
        {common('comingSoon')}
      </div>
      <PublicHomeClient />
    </section>
  );
}
