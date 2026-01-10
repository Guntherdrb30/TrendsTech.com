import { prisma } from '@trends172tech/db';
import { requireAuth } from '@/lib/auth/guards';
import { ProfileForm } from '@/components/profile-form';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
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
      <section className="space-y-2">
        <h1 className="text-2xl font-semibold">Profile</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">User not found.</p>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Profile</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Keep your contact details updated for new agents.
        </p>
      </div>
      <ProfileForm
        initialName={profile.name ?? ''}
        email={profile.email}
        initialPhone={profile.phone ?? ''}
        initialAvatarUrl={profile.avatarUrl ?? ''}
      />
    </section>
  );
}
