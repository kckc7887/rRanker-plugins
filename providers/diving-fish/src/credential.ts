import { isCredential } from '@rranker/sdk/credentials';

export type DivingFishSession = { mode: 'jwt' | 'import-token'; value: string; persistable: true }
  | { mode: 'cookie-jar'; persistable: false };

export function parseCredential(value: unknown): DivingFishSession | null {
  if (!isCredential(value)) return null;
  if (value.mode === 'cookie-jar' && value.persistable === false) return value as DivingFishSession;
  return (value.mode === 'jwt' || value.mode === 'import-token') && value.persistable === true
    && typeof value.value === 'string' && value.value.length > 0 ? value as DivingFishSession : null;
}
