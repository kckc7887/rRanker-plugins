import { parseOAuthCredential, type OAuthCredential } from '@rranker/sdk/credentials';

export type OsuOAuthSession = OAuthCredential<'osu-oauth'>;
export const parseCredential = (value: unknown): OsuOAuthSession | null => parseOAuthCredential(value, 'osu-oauth');

export function credentialMatches(current: unknown, expected: unknown): boolean {
  const left = parseCredential(current), right = parseCredential(expected);
  return !!left && !!right && (left.refreshToken === right.refreshToken
    || require('./providers/osu-oauth').osuRotationAncestors(right.refreshToken).includes(left.refreshToken));
}
