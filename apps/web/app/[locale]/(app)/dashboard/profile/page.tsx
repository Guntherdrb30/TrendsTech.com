import { prisma } from '@trends172tech/db';
import { requireAuth } from '@/lib/auth/guards';
import { ProfileForm } from '@/components/profile-form';
import { ChangePasswordForm } from '@/components/change-password-form';

export const dynamic = 'force-dynamic';

export default async function ProfilePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const isEs = locale.startsWith('es');
  const user = await requireAuth();
  const profile = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      name: true,
      email: true,
      phone: true,
      avatarUrl: true
    }
  });

  if (!profile) {
    return (
      <section className="space-y-6">
        <div className="interactive-panel premium-noise overflow-hidden rounded-[34px] border border-black/8 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] px-6 py-7 shadow-[0_35px_100px_-72px_rgba(15,23,42,0.35)] sm:px-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-4xl">{isEs ? 'Perfil' : 'Profile'}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">{isEs ? 'Usuario no encontrado.' : 'User not found.'}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="interactive-panel premium-noise overflow-hidden rounded-[34px] border border-black/8 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] px-6 py-7 shadow-[0_35px_100px_-72px_rgba(15,23,42,0.35)] sm:px-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <div className="inline-flex rounded-full border border-black/8 bg-white/90 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
              {isEs ? 'Control de cuenta' : 'Account control'}
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-4xl">{isEs ? 'Perfil' : 'Profile'}</h1>
              <p className="max-w-2xl text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                {isEs ? 'Mantén actualizados tus datos para nuevos agentes y acceso operativo seguro.' : 'Keep your contact details updated for new agents and secured operational access.'}
              </p>
            </div>
          </div>
          <div className="interactive-panel rounded-[24px] border border-black/8 bg-white/92 px-5 py-4 shadow-[0_18px_45px_-36px_rgba(15,23,42,0.24)]">
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{isEs ? 'Correo principal' : 'Primary email'}</div>
            <div className="mt-2 text-sm font-semibold text-slate-900">{profile.email}</div>
          </div>
        </div>
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <ProfileForm
          initialName={profile.name ?? ''}
          email={profile.email}
          initialPhone={profile.phone ?? ''}
          initialAvatarUrl={profile.avatarUrl ?? ''}
        />
        <ChangePasswordForm locale={locale} />
      </div>
    </section>
  );
}
