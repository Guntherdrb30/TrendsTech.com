import type { ReactNode } from 'react';
import Script from 'next/script';

export const runtime = 'nodejs';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>
        {children}
        <Script
          src="https://cdn.trends172tech.com/widget.js"
          strategy="afterInteractive"
        />
        <Script id="trends172-widget-init" strategy="afterInteractive">
          {`
            Trends172Widget.init({
              installId: "inst_71ea74f03b5c41219081316b"
            });
          `}
        </Script>
      </body>
    </html>
  );
}
