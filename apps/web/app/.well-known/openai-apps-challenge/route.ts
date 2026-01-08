import { OPENAI_APPS_CHALLENGE_TOKEN } from '@/lib/openai/verification';

const textHeaders = { 'Content-Type': 'text/plain' };

export function GET() {
  return new Response(OPENAI_APPS_CHALLENGE_TOKEN, {
    status: 200,
    headers: textHeaders
  });
}

export function HEAD() {
  return new Response(null, { status: 200, headers: textHeaders });
}
