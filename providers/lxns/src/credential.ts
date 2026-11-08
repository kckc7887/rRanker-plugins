import { parseOAuthCredential, type OAuthCredential } from '@rranker/sdk/credentials';

export type LxnsOAuthSession = OAuthCredential<'lxns-oauth'>;
export const parseCredential = (value: unknown): LxnsOAuthSession | null => parseOAuthCredential(value, 'lxns-oauth');

export function credentialMatches(current: unknown, expected: unknown): boolean {
  const left = parseCredential(current), right = parseCredential(expected);
  return !!left && !!right && (left.refreshToken === right.refreshToken
    || require('./providers/lxns-oauth').lxnsRotationAncestors(right.refreshToken).includes(left.refreshToken));
}
