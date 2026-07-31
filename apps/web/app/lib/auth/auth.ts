import { after } from 'next/server';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { jwt } from 'better-auth/plugins';
import { prisma } from '@trends172tech/db';
import { sendEmail } from '@/lib/email/send';
import { hashPassword, verifyPassword } from './password';

const siteUrl = (process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000')
  .replace(/\/$/, '');
const trustedOrigins = Array.from(new Set([
  siteUrl,
  ...(process.env.AUTH_TRUSTED_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim().replace(/\/$/, ''))
    .filter(Boolean)
]));

function localeFromUrl(url: string) {
  try {
    const locale = new URL(url).pathname.split('/').filter(Boolean)[0];
    return locale === 'en' ? 'en' : 'es';
  } catch {
    return 'es';
  }
}

function scheduleEmail(task: () => Promise<unknown>) {
  after(async () => {
    try {
      await task();
    } catch (error) {
      console.error('[auth] transactional email failed', error);
    }
  });
}

export const auth = betterAuth({
  appName: 'Trends172 Tech',
  baseURL: siteUrl,
  secret: process.env.BETTER_AUTH_SECRET || process.env.AUTH_SECRET,
  database: prismaAdapter(prisma, {
    provider: 'postgresql'
  }),
  trustedOrigins,
  user: {
    modelName: 'User',
    fields: {
      image: 'avatarUrl'
    },
    additionalFields: {
      tenantId: {
        type: 'string',
        required: false,
        input: false
      },
      phone: {
        type: 'string',
        required: false,
        input: false
      },
      role: {
        type: 'string',
        required: true,
        defaultValue: 'TENANT_VIEWER',
        input: false
      }
    }
  },
  session: {
    modelName: 'AuthSession',
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24
  },
  account: {
    modelName: 'AuthAccount'
  },
  verification: {
    modelName: 'AuthVerification'
  },
  emailAndPassword: {
    enabled: true,
    disableSignUp: process.env.AUTH_DISABLE_SIGN_UP === 'true',
    minPasswordLength: 12,
    maxPasswordLength: 128,
    requireEmailVerification: true,
    revokeSessionsOnPasswordReset: true,
    resetPasswordTokenExpiresIn: 60 * 60,
    password: {
      hash: hashPassword,
      verify: verifyPassword
    },
    sendResetPassword: async ({ user, url }) => {
      const locale = localeFromUrl(url);
      scheduleEmail(() => sendEmail({
        to: user.email,
        subject: locale === 'es' ? 'Recupera tu contraseña' : 'Reset your password',
        template: 'reset-password',
        templateData: { resetUrl: url, userName: user.name },
        locale
      }));
    }
  },
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
    expiresIn: 60 * 60,
    sendVerificationEmail: async ({ user, url }) => {
      const locale = localeFromUrl(url);
      scheduleEmail(() => sendEmail({
        to: user.email,
        subject: locale === 'es' ? 'Verifica tu correo' : 'Verify your email',
        template: 'verify-email',
        templateData: { verificationUrl: url, userName: user.name },
        locale
      }));
    }
  },
  rateLimit: {
    enabled: true,
    window: 60,
    max: 100,
    storage: 'database',
    customRules: {
      '/sign-in/email': { window: 60 * 15, max: 10 },
      '/request-password-reset': { window: 60 * 15, max: 5 },
      '/send-verification-email': { window: 60 * 15, max: 5 }
    }
  },
  plugins: [
    jwt({
      schema: {
        jwks: {
          modelName: 'AuthJwks'
        }
      },
      jwt: {
        issuer: siteUrl,
        audience: 'trends172tech-apps',
        expirationTime: '15m',
        definePayload: ({ user }) => ({
          sub: user.id,
          email: user.email,
          role: user.role,
          tenantId: user.tenantId ?? null
        })
      }
    })
  ]
});

export type AuthSession = typeof auth.$Infer.Session;
