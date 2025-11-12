// apps/web/app/api/backend/[...path]/route.ts
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// API base ưu tiên server-only, fallback public var
const API_BASE =
  (process.env.API_ABSOLUTE_URL ||
    process.env.NEXT_PUBLIC_API_ABSOLUTE_URL ||
    'http://localhost:4000'
  ).replace(/\/$/, '');

async function handler(req: Request, ctx: { params: { path: string[] } }) {
  if (!API_BASE.startsWith('http')) {
    return NextResponse.json(
      { error: 'API_ABSOLUTE_URL is missing/invalid' },
      { status: 500 },
    );
  }

  const { path } = ctx.params;
  const reqUrl = new URL(req.url);
  const target = new URL(`${API_BASE}/${path.join('/')}`);
  target.search = reqUrl.search; // giữ query string

  // Copy headers, bỏ host
  const headers = new Headers(req.headers);
  headers.delete('host');

  // Chuẩn bị body cho các method có body
  const method = req.method.toUpperCase();
  const hasBody = !['GET', 'HEAD'].includes(method);
  const init: RequestInit = { method, headers };
  if (hasBody) init.body = await req.arrayBuffer();

  // Gọi API thật
  const upstream = await fetch(target.toString(), {
    ...init,
    redirect: 'manual',
  });

  // Stream body + header về client
  const res = new NextResponse(upstream.body, {
    status: upstream.status,
  });

  // Copy các header cần thiết
  upstream.headers.forEach((v, k) => {
    // tránh set trùng hoặc các hop-by-hop
    if (!['content-length', 'transfer-encoding', 'connection'].includes(k)) {
      res.headers.set(k, v);
    }
  });

  // ⚠️ Chuyển tiếp cookie về đúng host (xóa Domain; đổi SameSite nếu cần)
  const setCookie = upstream.headers.get('set-cookie');
  if (setCookie) {
    const rewritten = setCookie
      .replace(/Domain=[^;]+;?\s*/gi, '') // để cookie gắn vào host hiện tại (web)
      .replace(/;\s*SameSite=None/gi, '; SameSite=Lax'); // an toàn hơn nếu không cần cross-site
    res.headers.set('set-cookie', rewritten);
  }

  return res;
}

export { handler as GET, handler as POST, handler as PUT, handler as PATCH, handler as DELETE, handler as OPTIONS };
