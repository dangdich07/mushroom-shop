// apps/web/lib/api.ts
import { Session } from 'next-auth';

const API_BASE_REL = (process.env.NEXT_PUBLIC_API_URL || '/api').replace(/\/$/, '');
const API_BASE_ABS = (
  process.env.NEXT_PUBLIC_API_ABSOLUTE_URL ||
  process.env.API_ABSOLUTE_URL ||
  'http://localhost:4000'
).replace(/\/$/, '');

const SESSION_COOKIE_NAME =
  process.env.NEXT_PUBLIC_SESSION_COOKIE_NAME || process.env.COOKIE_NAME || 'session';

function safeIdemKey() {
  try {
    // @ts-ignore
    if (typeof crypto !== 'undefined' && crypto?.randomUUID) return crypto.randomUUID();
  } catch {}
  return `idem-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function buildUrl(path: string) {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const isServer = typeof window === 'undefined';

  if (isServer) {
    if (/^https?:\/\//i.test(API_BASE_REL)) return `${API_BASE_REL}${cleanPath}`;
    return `${API_BASE_ABS}${cleanPath.replace(/^\/api/, '')}`;
  }
  if (/^https?:\/\//i.test(API_BASE_REL)) return `${API_BASE_REL}${cleanPath}`;
  return `${API_BASE_REL}${cleanPath}`;
}

export async function getJSON<T>(path: string, sessionOrInit?: Session | RequestInit | null) {
  let init: RequestInit | undefined;

  if (sessionOrInit && typeof (sessionOrInit as Session).user !== 'undefined') {
    const s = sessionOrInit as Session;
    const token =
      (s as any).accessToken || (s as any).backendSessionToken || (s as any).sessionToken || '';
    init = { headers: { Authorization: token ? `Bearer ${token}` : '' } };
  } else {
    init = sessionOrInit as RequestInit;
  }

  const headers = new Headers({ 'Content-Type': 'application/json', ...(init?.headers || {}) });
  const requestInit: RequestInit = { ...init, headers, cache: 'no-store' };

  if (typeof window === 'undefined') {
    try {
      const { cookies } = await import('next/headers');
      const store = cookies();
      const c = store.get(SESSION_COOKIE_NAME);
      if (c?.value) {
        headers.set('cookie', `${c.name}=${c.value}`);
        requestInit.credentials = 'include';
      }
    } catch {}
  }

  const url = buildUrl(path);
  const res = await fetch(url, requestInit);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} - ${url}\n${text}`);
  }
  return res.json() as Promise<T>;
}

export async function createCheckoutSession(
  items: { sku: string; qty: number }[],
  idem?: string
) {
  const res = await fetch('/api/backend/checkout/session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Idempotency-Key': idem || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `idem-${Date.now()}`),
    },
    body: JSON.stringify({ items }),
    credentials: 'include',
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} - ${text}`);
  }

  // Đọc thô rồi tự parse để chống case Render/Cloudflare trả về chuỗi URL
  const contentType = res.headers.get('content-type') || '';
  const raw = await res.text();

  // 1) JSON object chuẩn
  if (contentType.includes('application/json')) {
    try {
      return JSON.parse(raw) as { id: string; url: string; orderId?: string };
    } catch {
      // rơi xuống nhánh 2
    }
  }

  // 2) Chuỗi URL thuần hoặc JSON string `"https://..."` → bóc quote rồi trả về
  const maybeUrl = raw.trim().replace(/^"|"$/g, '');
  if (/^https?:\/\//i.test(maybeUrl)) {
    return { id: '', url: maybeUrl, orderId: undefined };
  }

  // 3) Không đoán được
  throw new Error(`Unexpected response from /checkout/session: ${maybeUrl.slice(0, 200)}`);
}
