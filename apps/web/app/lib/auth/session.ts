import type { NextAuthOptions } from 'next-auth';
import { getServerSession } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import { prisma } from '@trends172tech/db';
import { checkRateLimit } from '@/lib/security/rate-limit';

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt'
  },
  secret: process.env.AUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
    async authorize(credentials, request) {
      const email = credentials?.email?.toLowerCase().trim();
      const password = credentials?.password;

      if (!email || !password) {
        console.warn('[auth] credentials signin failed - missing email or password');
        return null;
      }

      const forwarded = request.headers?.['x-forwarded-for'];
      const rawIdentifier = Array.isArray(forwarded) ? forwarded[0] : forwarded;
      const ip = rawIdentifier?.split(',')[0]?.trim() || request.headers?.['x-real-ip'] || 'unknown';
      const loginLimit = checkRateLimit(`${ip}:${email}`, {
        namespace: 'auth-login',
        limit: 10,
        windowMs: 15 * 60 * 1000
      });
      if (!loginLimit.allowed) {
        console.warn('[auth] credentials signin rate limited');
        return null;
      }

      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user || !user.passwordHash) {
        console.warn('[auth] credentials signin failed - user missing or no password hash');
        return null;
      }

      const isValid = await compare(password, user.passwordHash);
      if (!isValid) {
        console.warn('[auth] credentials signin failed - invalid password');
        return null;
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name ?? undefined,
        phone: user.phone ?? undefined,
        avatarUrl: user.avatarUrl ?? undefined,
        role: user.role,
        tenantId: user.tenantId
      };
    }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.role = user.role;
        token.tenantId = user.tenantId ?? null;
        token.phone = user.phone ?? null;
        token.avatarUrl = user.avatarUrl ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.role = token.role as string;
        session.user.tenantId = token.tenantId as string | null;
        session.user.phone = (token.phone as string | null) ?? null;
        session.user.avatarUrl = (token.avatarUrl as string | null) ?? null;
      }
      return session;
    }
  }
};

export function getServerAuthSession() {
  return getServerSession(authOptions);
}
