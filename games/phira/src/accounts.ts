import type { BoundAccount } from '@rranker/sdk/account';
import { getDataSource } from '@rranker/sdk/registry';
import { getGameProfile } from '@rranker/sdk/domain/game-profile';

export function createPhiraBoundAccount(input: {
  playerId: number; displayName: string; rks?: number | null; avatarUrl?: string | null;
}): BoundAccount {
  const profile = getGameProfile('phira');
  return {
    id: `phira:community:${input.playerId}`,
    gameId: 'phira',
    providerId: 'phira-community',
    displayName: input.displayName,
    scoreLabel: profile.ratingLabel,
    scoreDisplay: input.rks == null || !Number.isFinite(input.rks) ? '—' : input.rks.toFixed(4),
    providerTitle: (getDataSource('phira-community')?.title ?? 'phira-community'),
    avatarUrl: input.avatarUrl,
  };
}

export function phiraPlayerIdFromAccountId(accountId: string): number | null {
  const match = /^phira:community:(\d+)$/.exec(accountId);
  if (!match) return null;
  const id = Number(match[1]);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}
