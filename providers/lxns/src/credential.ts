import { rotationAncestors } from './rotation-history';
import { parseOAuthCredential, type OAuthCredential } from '@rranker/sdk/credentials';

export type LxnsOAuthSession = OAuthCredential<'lxns-oauth'>;
export const parseCredential = (value: unknown): LxnsOAuthSession | null => parseOAuthCredential(value, 'lxns-oauth');

export function credentialMatches(current: unknown, expected: unknown): boolean {
  const left = parseCredential(current), right = parseCredential(expected);
  return !!left && !!right && (left.refreshToken === right.refreshToken
    || rotationAncestors.get(right.refreshToken)?.has(left.refreshToken) === true);
}
