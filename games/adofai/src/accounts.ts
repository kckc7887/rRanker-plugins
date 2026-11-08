import type { BoundAccount } from '@rranker/sdk/account';
import { getDataSource } from '@rranker/sdk/registry';
import { getGameProfile } from '@rranker/sdk/domain/game-profile';

export function createTufBoundAccount(input: {
  playerId: number;
  displayName: string;
  avatarUrl?: string | null;
  rankedScore?: number | null;
}): BoundAccount {
  const profile = getGameProfile('adofai');
  return {
    id: `adofai:tuf:${input.playerId}`,
    gameId: 'adofai',
    providerId: 'tuf',
    displayName: input.displayName,
    scoreLabel: profile.ratingLabel,
    scoreDisplay: input.rankedScore == null || !Number.isFinite(input.rankedScore) ? '—' : input.rankedScore.toFixed(2),
    providerTitle: (getDataSource('tuf')?.title ?? 'tuf'),
    avatarUrl: input.avatarUrl,
  };
}

export function tufPlayerIdFromAccountId(accountId: string): number | null {
  const match = /^adofai:tuf:(\d+)$/.exec(accountId);
  if (!match) return null;
  const playerId = Number(match[1]);
  return Number.isSafeInteger(playerId) && playerId > 0 ? playerId : null;
}
