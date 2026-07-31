export const runtime = "edge";
export const dynamic = "force-dynamic";

export function GET() {
  const token = process.env.OPENAI_VERIFICATION_TOKEN;

  if (!token) {
    return new Response('Verification token is not configured.', {
      status: 503,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-store, max-age=0',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  }

  return new Response(token, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store, max-age=0",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
