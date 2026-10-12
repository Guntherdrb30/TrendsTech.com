import { AuthError } from '@/lib/auth/guards';
/** A deployed Preview must explicitly be linked to a reviewed isolated DB. Local fixtures do not carry VERCEL_URL. */
export function isControlPreviewReady() {
  return !(process.env.VERCEL_ENV === 'preview' && process.env.VERCEL_URL) || process.env.LUNA_CONTROL_PREVIEW_DATABASE_ISOLATED === 'true';
}
export function assertControlPreviewReady() {
  if (!isControlPreviewReady()) throw new AuthError(503, 'LUNA Preview requires a verified isolated database');
}
