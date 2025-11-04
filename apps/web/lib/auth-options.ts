// apps/web/lib/auth-options.ts 
import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

const API_BASE =
  (process.env.NEXT_PUBLIC_API_ABSOLUTE_URL ||
    process.env.API_ABSOLUTE_URL ||
    'http://localhost:4000').replace(/\/$/, '');

// ✅ Fail-fast: bắt buộc phải có NEXTAUTH_SECRET, tránh dùng fallback khiến JWT giải mã sai
if (!process.env.NEXTAUTH_SECRET) {
  throw new Error('Missing NEXTAUTH_SECRET for NextAuth');
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,        // BẮT BUỘC khi dùng JWT (bỏ fallback)
  session: { strategy: 'jwt' },

  providers: [
    CredentialsProvider({
      name: 'Email & Password',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Mật khẩu', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const res = await fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password,
          }),
        }).catch(() => null);

        if (!res || !res.ok) return null;
        const data = await res.json().catch(() => null);
        if (!data?.user) return null;

        return {
          id: data.user._id || data.user.id || data.user.email,
          name: data.user.name || data.user.email,
          email: data.user.email,
          roles: data.user.roles || [],
          accessToken: data.accessToken || data.token, // tuỳ backend
          refreshToken: data.refreshToken,
        } as any;
      },
    }),
  ],

  pages: {
    signIn: '/login',
    error: '/login',
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.roles = (user as any).roles || [];
        token.accessToken = (user as any).accessToken;
        token.refreshToken = (user as any).refreshToken;
      }
      return token;
    },
    async session({ session, token }) {
      (session as any).roles = token.roles || [];
      (session as any).accessToken = token.accessToken || null;
      return session;
    },
  },
};
