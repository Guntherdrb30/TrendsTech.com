export const runtime = "edge";
export const dynamic = "force-dynamic";

export function GET() {
  const token =
    process.env.OPENAI_VERIFICATION_TOKEN ??
    "HiipP67up2y9b98TlN8i6eUxZwKudIUPC3_B4V5OkNw";

  return new Response(token, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store, max-age=0",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
