'use client';

import { useFormStatus } from 'react-dom';

function SubmitButton() {
  const { pending } = useFormStatus();
  return <button type="submit" disabled={pending} className="w-full rounded-full border border-rose-300 px-5 py-3 text-sm font-semibold text-rose-700 disabled:opacity-50">
    {pending ? 'Desconectando…' : 'Desconectar de Studio'}
  </button>;
}

export function DisconnectVercelButton({ action, locale, projectId, projectName }: {
  action: (formData: FormData) => Promise<void>;
  locale: string;
  projectId: string;
  projectName: string;
}) {
  return <form action={action} onSubmit={(event) => {
    const confirmed = window.confirm(`¿Desconectar “${projectName}”?\n\nEste proyecto se desconectará de Engineering Studio. El proyecto, sus deployments y su configuración permanecerán intactos en Vercel.`);
    if (!confirmed) event.preventDefault();
  }}>
    <input type="hidden" name="locale" value={locale}/>
    <input type="hidden" name="projectId" value={projectId}/>
    <SubmitButton/>
  </form>;
}
