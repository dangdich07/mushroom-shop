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
      'Idempotency-Key':
        idem ||
        (typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID()
          : String(Date.now())),
    },
    body: JSON.stringify({ items }),
    credentials: 'include',
  });

  // Đọc raw text đúng 1 lần, rồi tự xử lý
  const ct = res.headers.get('content-type') || '';
  const raw = await res.text();

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${raw.slice(0, 300)}`);
  }

  // 1) Trường hợp chuẩn (JSON)
  const trimmed = raw.trim();
  if (ct.includes('application/json') || trimmed.startsWith('{') || trimmed.startsWith('[')) {
    return JSON.parse(trimmed) as { id?: string; url?: string; orderId?: string };
  }

  // 2) Backend/proxy trả URL dạng text/plain → vẫn xử lý được
  if (/^https?:\/\//i.test(trimmed)) {
    return { url: trimmed } as { id?: string; url?: string; orderId?: string };
  }

  // 3) HTML (404/redirect/login) → báo lỗi rõ ràng
  if (trimmed.startsWith('<')) {
    throw new Error(
      'Backend trả HTML thay vì JSON (có thể 404/redirect/login). Kiểm tra log dịch vụ API trên Render.'
    );
  }

  // 4) Fallback
  throw new Error(`Phản hồi không phải JSON: ${trimmed.slice(0, 300)}`);
}
