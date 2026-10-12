import { buildLocalizedMetadata } from '@/lib/seo';
import { ProjectIntakeChat } from './project-intake-chat';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return buildLocalizedMetadata({
    locale,
    pathname: 'cuentanos-tu-idea',
    title: { es: 'Cuéntanos tu idea | Desarrollo de Software e IA | Trends172Tech', en: 'Tell us your idea | AI Software Development | Trends172Tech' },
    description: { es: 'Comparte una idea de software, automatización o mejora tecnológica. Nuestro asesor te ayuda a organizar tus requerimientos.', en: 'Explore an idea for custom software, automation or AI with a guided discovery conversation.' }
  });
}

export default async function ProjectIntakePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const language = locale.startsWith('es') ? 'es' : 'en';
  return <main className="min-h-screen bg-[linear-gradient(180deg,#edfafa,#fff_52%)] px-5 py-16 sm:px-8">
    <div className="mx-auto mb-9 max-w-4xl"><p className="text-xs font-semibold uppercase tracking-[.22em] text-teal-700">Trends172Tech</p>
      <h1 className="mt-4 text-4xl font-semibold tracking-[-.05em] text-slate-950 sm:text-6xl">{language === 'es' ? 'Cuéntanos tu idea.' : 'Tell us your idea.'}</h1>
      <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">{language === 'es' ? '¿Una plataforma nueva, una automatización o una mejora de tu software? Hablemos de lo que quieres construir.' : 'New software, automation, or improvements to your current system? Let us explore what you want to build.'}</p></div>
    <ProjectIntakeChat locale={language} />
  </main>;
}
