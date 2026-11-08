import { isCredential } from '@rranker/sdk/credentials';

export type PhigrosSession = { mode: 'phi-session'; sessionToken: string; openid: string; displayName: string; persistable: true };

export function parseCredential(value: unknown): PhigrosSession | null {
  if (!isCredential(value) || value.mode !== 'phi-session' || value.persistable !== true
    || typeof value.sessionToken !== 'string' || !value.sessionToken
    || typeof value.openid !== 'string' || !value.openid || typeof value.displayName !== 'string') return null;
  return value as PhigrosSession;
}
