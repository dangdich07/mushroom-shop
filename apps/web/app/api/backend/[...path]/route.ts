// apps/web/app/api/backend/[...path]/route.ts
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const API_BASE = (
  process.env.API_ABSOLUTE_URL ||
  process.env.NEXT_PUBLIC_API_ABSOLUTE_URL ||
  ''
).replace(/\/+$/, '');

if (!API_BASE) {
  console.warn('[backend-proxy] Missing API_ABSOLUTE_URL. Set it on Render!');
}

async function proxy(req: NextRequest, ctx: { params: { path?: string[] } }) {
  const segments = ctx.params.path ?? [];
  const target = `${API_BASE}/${segments.join('/')}${req.nextUrl.search}`;

  const init: RequestInit = {
    method: req.method,
    headers: {
      cookie: req.headers.get('cookie') ?? '',
      ...(req.headers.get('content-type')
        ? { 'content-type': req.headers.get('content-type') as string }
        : {}),
    },
    body:
      req.method === 'GET' || req.method === 'HEAD'
        ? undefined
        : Buffer.from(await req.arrayBuffer()),
    cache: 'no-store',
  };

  const res = await fetch(target, init);

  const headers = new Headers(res.headers);
  headers.delete('content-encoding');
  headers.delete('transfer-encoding');

  const ctype = headers.get('content-type') || '';
  const raw = await res.text();

  if (ctype.includes('application/json')) {
    try {
      const json = JSON.parse(raw);
      return NextResponse.json(json, { status: res.status, headers });
    } catch {
      // Trường hợp JSON bị cắt lở: cố gắng cứu URL Stripe nếu có
      const m = raw.match(/https?:\/\/checkout\.stripe\.com\/[^\s"'<]+/i);
      if (m) {
        return NextResponse.json({ id: '', url: m[0] }, { status: res.status, headers });
      }
      headers.set('content-type', 'text/plain; charset=utf-8');
      return new NextResponse(raw, { status: 502, headers });
    }
  }

  // Không phải JSON → trả thẳng dạng text đã buffer
  return new NextResponse(raw, { status: res.status, headers });
}

export { proxy as GET, proxy as POST, proxy as PUT, proxy as PATCH, proxy as DELETE };
