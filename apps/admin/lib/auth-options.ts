import type { AuthOptions } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { cookies } from 'next/headers';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const API_SESSION_COOKIE_NAME =
  process.env.NEXT_PUBLIC_SESSION_COOKIE_NAME || process.env.COOKIE_NAME || 'session';

export const authOptions: AuthOptions = {
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const res = await fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: credentials.email, password: credentials.password }),
          credentials: 'include'
        });

        if (!res.ok) return null;
        const data = await res.json();

        const token = data?.session?.token || data?.token || null;

        // Bridge: ghi cookie phiên backend về phía Next.js (không bắt buộc)
        if (token) {
          try {
            const cookieStore = cookies();
            const cookieConfig = data.session?.cookie || {};
            const maxAgeSeconds =
              typeof cookieConfig.maxAgeSeconds === 'number' && cookieConfig.maxAgeSeconds > 0
                ? cookieConfig.maxAgeSeconds
                : typeof cookieConfig.maxAgeMs === 'number' && cookieConfig.maxAgeMs > 0
                ? Math.floor(cookieConfig.maxAgeMs / 1000)
                : 7 * 24 * 60 * 60;

            cookieStore.set(cookieConfig.name || API_SESSION_COOKIE_NAME, token, {
              httpOnly: cookieConfig.httpOnly !== false,
              sameSite: (cookieConfig.sameSite as any) || 'lax',
              secure: cookieConfig.secure === true,
              path: cookieConfig.path || '/',
              maxAge: maxAgeSeconds
            });
          } catch {
            // ignore
          }
        }

        return {
          id: data.user?.id || data.id,
          email: data.user?.email || data.email,
          roles: data.user?.roles || data.roles || [],
          sessionToken: token
        } as any;
      }
    })
  ],
  session: { strategy: 'jwt' as const },
  callbacks: {
  // 🔐 Ghi thông tin vào JWT
  async jwt({ token, user }) {
    // Khi đăng nhập lần đầu
    if (user) {
      (token as any).id = (user as any).id;
      token.email = (user as any).email;
      (token as any).roles = (user as any).roles || [];

      if ((user as any).sessionToken) {
        (token as any).backendSessionToken = (user as any).sessionToken;
      }
    }

    // 🔄 Nếu có backendSessionToken thì xác minh lại /auth/me để lấy roles mới nhất
    const backendToken = (token as any).backendSessionToken;
    if (backendToken) {
      try {
        const res = await fetch(`${API_BASE}/auth/me`, {
          headers: {
            Authorization: `Bearer ${backendToken}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });

        if (res.ok) {
          const data = await res.json();
          if (data?.user) {
            (token as any).id = data.user.id;
            token.email = data.user.email;
            (token as any).roles = data.user.roles || [];
          }
        }
      } catch (err) {
        console.warn('[jwt callback] Fetch /auth/me failed:', err);
      }
    }

    return token;
  },

  // 🧭 Ghi JWT ra session gửi xuống client
  async session({ session, token }) {
    (session as any).user = {
      id: (token as any).id,
      email: token.email,
      roles: (token as any).roles || []
    };

    // giữ accessToken để client gọi API dễ dàng
    if ((token as any).backendSessionToken) {
      (session as any).accessToken = (token as any).backendSessionToken;
    }

    return session;
  }
},

  pages: { signIn: '/(account)/login' },
  secret: process.env.NEXTAUTH_SECRET
};
