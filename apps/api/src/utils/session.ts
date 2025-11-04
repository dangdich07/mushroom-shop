import crypto from 'node:crypto';
import type { Response } from 'express';

const DEFAULT_COOKIE_NAME = process.env.COOKIE_NAME || 'session';
const DEFAULT_SECRET = process.env.SESSION_SECRET || process.env.JWT_SECRET || '2f6e3b2a8d9c7e41bcd67e2ff51c6a98b2c3a4f17d9e6a23e84b0a2d9f9b7c1d';
const DEFAULT_MAX_AGE_SECONDS = (() => {
  const fromEnv = process.env.SESSION_TTL_SECONDS || process.env.SESSION_MAX_AGE_SECONDS;
  if (!fromEnv) return 7 * 24 * 60 * 60; // 7 days
  const parsed = Number(fromEnv);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 7 * 24 * 60 * 60;
})();

export type SessionPayload = {
  id: string;
  roles: string[];
};

type EncodedSession = SessionPayload & { exp: number };

function base64UrlEncode(value: Buffer | string) {
  return Buffer.from(value).toString('base64url');
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, 'base64url');
}

function signPayload(payload: EncodedSession) {
  const encoded = base64UrlEncode(JSON.stringify(payload));
  const signature = crypto.createHmac('sha256', DEFAULT_SECRET).update(encoded).digest();
  return `${encoded}.${base64UrlEncode(signature)}`;
}

function verifySignature(encoded: string, signature: string) {
  const expected = crypto.createHmac('sha256', DEFAULT_SECRET).update(encoded).digest();
  const received = base64UrlDecode(signature);
  if (expected.length !== received.length) return false;
  return crypto.timingSafeEqual(expected, received);
}

function decodeToken(token: string | undefined): EncodedSession | null {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [encodedPayload, signature] = parts;
  if (!verifySignature(encodedPayload, signature)) return null;
  try {
    const json = JSON.parse(base64UrlDecode(encodedPayload).toString('utf8')) as Partial<EncodedSession>;
    if (!json || typeof json !== 'object') return null;
    const { id, roles, exp } = json;
    if (typeof id !== 'string' || typeof exp !== 'number') return null;
    if (Number.isFinite(exp) && exp * 1000 < Date.now()) return null;
    const normalizedRoles = Array.isArray(roles) ? roles.filter((r): r is string => typeof r === 'string') : [];
    return { id, roles: normalizedRoles, exp };
  } catch {
    return null;
  }
}

function getCookieName() {
  return DEFAULT_COOKIE_NAME;
}

function getCookieOptions() {
  return {
    httpOnly: true as const,
    secure: process.env.COOKIE_SECURE === 'true',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: DEFAULT_MAX_AGE_SECONDS * 1000
  };
}

export function signSessionToken(payload: SessionPayload) {
  const body: EncodedSession = {
    id: payload.id,
    roles: payload.roles,
    exp: Math.floor(Date.now() / 1000) + DEFAULT_MAX_AGE_SECONDS
  };
  return signPayload(body);
}

export function verifySessionToken(token: string | undefined): SessionPayload | null {
  const decoded = decodeToken(token);
  if (!decoded) return null;
  return { id: decoded.id, roles: decoded.roles };
}

export function attachSessionCookie(res: Response, payload: SessionPayload) {
  const token = signSessionToken(payload);
  res.cookie(getCookieName(), token, getCookieOptions());
  return token;
}

export function clearSessionCookie(res: Response) {
  const options = getCookieOptions();
  res.clearCookie(getCookieName(), { ...options, maxAge: undefined });
}

export const sessionConfig = {
  get cookieName() {
    return getCookieName();
  },
  get cookieOptions() {
    return getCookieOptions();
  },
  get clientMetadata() {
    const options = getCookieOptions();
    return {
      name: getCookieName(),
      path: options.path,
      sameSite: options.sameSite,
      secure: options.secure,
      httpOnly: options.httpOnly,
      maxAgeMs: options.maxAge,
      maxAgeSeconds: Math.floor(options.maxAge / 1000)
    } as const;
  }
};