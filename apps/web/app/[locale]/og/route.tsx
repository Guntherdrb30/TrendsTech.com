import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ locale: string }> }
) {
  const { locale } = await params;
  const isEs = locale.startsWith('es');

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px 72px',
          color: '#f8fafc',
          backgroundColor: '#070b12',
          backgroundImage:
            'radial-gradient(circle at 82% 18%, rgba(20,217,217,0.24), transparent 34%), radial-gradient(circle at 12% 92%, rgba(14,116,144,0.20), transparent 38%), linear-gradient(135deg, #070b12 0%, #0c1622 55%, #07121a 100%)',
          fontFamily: 'Arial, Helvetica, sans-serif',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            opacity: 0.12,
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.10) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.10) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div
            style={{
              width: 72,
              height: 72,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '3px solid #14d9d9',
              borderRadius: 999,
              color: '#14d9d9',
              fontSize: 42,
              fontWeight: 800,
              lineHeight: 1,
            }}
          >
            T
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div
              style={{ display: 'flex', fontSize: 34, fontWeight: 700, letterSpacing: '-1px' }}
            >
              Trends<span style={{ color: '#14d9d9' }}>172</span>Tech
            </div>
            <div
              style={{
                marginTop: 6,
                color: '#94a3b8',
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: '4px',
                textTransform: 'uppercase',
              }}
            >
              Software · AI · Automation
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 900 }}>
          <div
            style={{
              color: '#14d9d9',
              fontSize: 16,
              fontWeight: 700,
              letterSpacing: '3px',
              textTransform: 'uppercase',
              marginBottom: 18,
            }}
          >
            {isEs ? 'Tecnología empresarial en producción' : 'Enterprise technology in production'}
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 62,
              lineHeight: 1.05,
              fontWeight: 800,
              letterSpacing: '-3px',
            }}
          >
            {isEs ? 'Tecnología que impulsa el futuro' : 'Technology that drives the future'}
          </div>
          <div style={{ marginTop: 22, color: '#cbd5e1', fontSize: 25, lineHeight: 1.4 }}>
            {isEs
              ? 'Software empresarial, automatización e inteligencia aplicada a operaciones reales.'
              : 'Business software, automation, and applied intelligence for real-world operations.'}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', gap: 12 }}>
            {['LUNA', 'CarpiHogar', 'LUNA Football'].map((product) => (
              <div
                key={product}
                style={{
                  display: 'flex',
                  padding: '10px 16px',
                  border: '1px solid rgba(20,217,217,0.34)',
                  borderRadius: 999,
                  backgroundColor: 'rgba(20,217,217,0.08)',
                  color: '#dffefe',
                  fontSize: 16,
                  fontWeight: 700,
                }}
              >
                {product}
              </div>
            ))}
          </div>
          <div style={{ color: '#94a3b8', fontSize: 17, fontWeight: 700 }}>
            trends172tech.com
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
      },
    }
  );
}
