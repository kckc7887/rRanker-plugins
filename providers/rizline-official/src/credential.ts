import { isCredential } from '@rranker/sdk/credentials';

export type RizlineSession = {
  mode: 'rizline'; token: string; phone: string; deviceId: string; channelId: string; persistable: true;
};

export function parseCredential(value: unknown): RizlineSession | null {
  if (!isCredential(value) || value.mode !== 'rizline' || value.persistable !== true
    || typeof value.token !== 'string' || !value.token || typeof value.phone !== 'string' || !/^1\d{10}$/.test(value.phone)
    || typeof value.deviceId !== 'string' || !value.deviceId || typeof value.channelId !== 'string' || !value.channelId) return null;
  return value as RizlineSession;
}

export function credentialMatches(current: unknown, expected: unknown): boolean {
  const left = parseCredential(current), right = parseCredential(expected);
  return !!left && !!right && left.token === right.token;
}
