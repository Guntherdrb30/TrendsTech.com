import type { ReactNode } from 'react';

export default function RootAreaLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen px-4 py-10">{children}</div>;
}
