import type { ReactNode } from 'react';

export const runtime = 'nodejs';

export default function PublicLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
