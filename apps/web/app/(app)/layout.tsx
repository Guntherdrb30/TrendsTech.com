import type { ReactNode } from 'react';

export const runtime = 'nodejs';

export default function AppLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
