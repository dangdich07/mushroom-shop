// ✅ Không dùng next-auth trong admin vì đây là hệ thống tách riêng
// import { Session } from 'next-auth'

export interface SessionLike {
  user?: { id?: string; email?: string; roles?: string[] };
  accessToken?: string;
  backendSessionToken?: string;
  sessionToken?: string;
}

/**
 * 🔹 API_BASE: vẫn giữ cho tương thích cũ, nhưng buildUrl mới là nơi quyết định cuối cùng.
 */
export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || '/api';

const SESSION_COOKIE_NAME =
  process.env.NEXT_PUBLIC_SESSION_COOKIE_NAME ||
  process.env.COOKIE_NAME ||
  'session';

/**
 * 🧠 Tạo URL tuyệt đối an toàn cho cả server + client
 * Ưu tiên:
 * 1. NEXT_PUBLIC_API_ABSOLUTE_URL (https://mushroom-shop.onrender.com)
 * 2. NEXT_PUBLIC_API_URL nếu là absolute URL
 * 3. NEXT_PUBLIC_API_URL nếu là relative (/api)
 * 4. Fallback localhost (cho dev)
 */
function buildUrl(path: string) {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  const absFromEnv =
    (process.env.NEXT_PUBLIC_API_ABSOLUTE_URL || '').trim().replace(/\/$/, '');
  const apiUrl = (process.env.NEXT_PUBLIC_API_URL || '').trim();

  const absApiUrl = apiUrl.startsWith('http')
    ? apiUrl.replace(/\/$/, '')
    : '';

  const relApiUrl = !apiUrl.startsWith('http')
    ? apiUrl.replace(/\/$/, '')
    : '';

  // Nếu có absolute URL (Render hoặc localhost) → dùng thẳng cho mọi nơi
  const absoluteBase =
    absFromEnv || absApiUrl || '';

  if (absoluteBase) {
    return `${absoluteBase}${cleanPath.replace(/^\/api/, '')}`;
  }

  // Không có absolute → server fallback localhost:4000
  if (typeof window === 'undefined') {
    const fallback = 'http://localhost:4000';
    return `${fallback}${cleanPath.replace(/^\/api/, '')}`;
  }

  // Client: nếu có base tương đối /api thì dùng, không thì path gốc
  if (relApiUrl) {
    return `${relApiUrl}${cleanPath}`;
  }

  return cleanPath;
}

/**
 * 📦 Fetch JSON từ API, tự động thêm Authorization header nếu có session JWT.
 */
export async function getJSON<T>(
  path: string,
  sessionOrInit?: SessionLike | RequestInit | null
): Promise<T> {
  let init: RequestInit | undefined;

  if (sessionOrInit && typeof (sessionOrInit as SessionLike).user !== 'undefined') {
    const session = sessionOrInit as SessionLike;
    const token =
      session.accessToken ||
      session.backendSessionToken ||
      session.sessionToken ||
      '';
    init = {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
    };
  } else {
    init = sessionOrInit as RequestInit;
  }

  const headers = new Headers({
    'Content-Type': 'application/json',
    ...(init?.headers || {}),
  });

  const requestInit: RequestInit = { ...init, headers, cache: 'no-store' };

  if (typeof window === 'undefined') {
    try {
      const { cookies } = await import('next/headers');
      const cookieStore = await cookies();
      const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
      if (sessionCookie?.value) {
        headers.set('cookie', `${sessionCookie.name}=${sessionCookie.value}`);
        requestInit.credentials = 'include';
      }
    } catch {
      // ignore khi cookies() không khả dụng (Edge runtime)
    }
  }

  const fullUrl = buildUrl(path);
  const res = await fetch(fullUrl, requestInit);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status} - ${fullUrl}\n${text}`);
  }
  return res.json();
}

/**
 * 🛒 Tạo phiên thanh toán
 */
export async function createCheckoutSession(
  items: { sku: string; qty: number }[],
  idem?: string
) {
  const fullUrl = buildUrl('/checkout/session');
  const res = await fetch(fullUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Idempotency-Key': idem || crypto.randomUUID(),
    },
    body: JSON.stringify({ items }),
    credentials: 'include',
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status} - ${fullUrl}\n${text}`);
  }
  return res.json() as Promise<{ id: string; url: string; orderId?: string }>;
}

/**
 * ❌ DELETE JSON (xóa dữ liệu)
 */
export async function deleteJSON(url: string, options: RequestInit = {}) {
  const fullUrl = buildUrl(url);
  const res = await fetch(fullUrl, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
  });
  if (!res.ok) throw new Error(`DELETE ${url} failed`);
  if (res.status === 204) return null;
  return res.json();
}

/**
 * ✏️ PUT JSON (chỉnh sửa dữ liệu)
 */
export async function putJSON<T extends Record<string, unknown>>(
  url: string,
  data: T,
  options: RequestInit = {}
) {
  const fullUrl = buildUrl(url);
  const res = await fetch(fullUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: JSON.stringify(data),
    credentials: 'include',
  });
  if (!res.ok) throw new Error(`PUT ${url} failed`);
  return res.json();
}

/**
 * ➕ POST JSON (tạo mới dữ liệu)
 */
export async function postJSON<T extends Record<string, unknown>>(
  url: string,
  data: T,
  options: RequestInit = {}
) {
  const fullUrl = buildUrl(url);
  const res = await fetch(fullUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: JSON.stringify(data),
    credentials: 'include',
  });
  if (!res.ok) throw new Error(`POST ${url} failed`);
  return res.json();
}
