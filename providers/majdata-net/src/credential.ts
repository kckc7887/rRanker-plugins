import { isHttpCookieSession, type HttpCookieSession } from './http-cookies';

export type { HttpCookieSession } from './http-cookies';

export function parseCredential(value: unknown): HttpCookieSession | null {
  return isHttpCookieSession(value) ? value : null;
}
