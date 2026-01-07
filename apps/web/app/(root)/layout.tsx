import type { ReactNode } from 'react';

export const runtime = 'nodejs';

export default function RootLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
