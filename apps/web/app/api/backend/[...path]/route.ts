import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Lấy URL API từ env (không còn fallback localhost trong production)
const API_BASE = (
  process.env.API_ABSOLUTE_URL ||
  process.env.NEXT_PUBLIC_API_ABSOLUTE_URL ||
  ''
).replace(/\/+$/, ''); // bỏ dấu / cuối

if (!API_BASE) {
  console.warn('[backend-proxy] Missing API_ABSOLUTE_URL. Set it on Render!');
}

async function proxy(req: NextRequest, ctx: { params: { path?: string[] } }) {
  const segments = ctx.params.path ?? [];
  const target = `${API_BASE}/${segments.join('/')}${req.nextUrl.search}`;

  const init: RequestInit = {
    method: req.method,
    // giữ cookie để phiên đăng nhập backend hoạt động
    headers: {
      cookie: req.headers.get('cookie') ?? '',
      // chuyển tiếp content-type nếu có
      ...(req.headers.get('content-type')
        ? { 'content-type': req.headers.get('content-type') as string }
        : {}),
    },
    body:
      req.method === 'GET' || req.method === 'HEAD'
        ? undefined
        : Buffer.from(await req.arrayBuffer()),
    // không cache
    cache: 'no-store',
  };

  const res = await fetch(target, init);

  // Trả thẳng body/headers/status về cho client
  const headers = new Headers(res.headers);
  headers.delete('content-encoding');
  return new NextResponse(res.body, { status: res.status, headers });
}

export { proxy as GET, proxy as POST, proxy as PUT, proxy as PATCH, proxy as DELETE };
