import type { BoundAccount } from '@rranker/sdk/account';
import { getDataSource } from '@rranker/sdk/registry';
import { getGameProfile } from '@rranker/sdk/domain/game-profile';

export const CHUNITHM_TEST_ACCOUNT_ID = 'chunithm:test';

export const CHUNITHM_TEMP_ACCOUNT_ID = 'chunithm:temp';

export function createChunithmTempAccount(): BoundAccount {
  const profile = getGameProfile('chunithm');
  return {
    id: CHUNITHM_TEMP_ACCOUNT_ID,
    gameId: 'chunithm',
    providerId: 'chunithm-temp',
    displayName: '临时账号',
    scoreLabel: profile.ratingLabel,
    scoreDisplay: '—',
    providerTitle: (getDataSource('chunithm-temp')?.title ?? 'chunithm-temp'),
    displayData: { ratingPossession: null },
  };
}

export function createMaxedChunithmTestAccount(
  rating = 0,
  displayName = '示例账号',
): BoundAccount {
  const profile = getGameProfile('chunithm');
  return {
    id: CHUNITHM_TEST_ACCOUNT_ID,
    gameId: 'chunithm',
    providerId: 'chunithm-test',
    displayName,
    scoreLabel: profile.ratingLabel,
    scoreDisplay: Number.isFinite(rating) ? rating.toFixed(2) : '—',
    providerTitle: (getDataSource('chunithm-test')?.title ?? 'chunithm-test'),
    displayData: { ratingPossession: 'rainbow' },
  };
}

export function createChunithmBoundAccount(input: {
  displayName: string;
  rating: number | null;
  playerId?: string;
  accountId?: string;
  avatarUrl?: string | null;
  ratingPossession?: string | null;
}): BoundAccount {
  const profile = getGameProfile('chunithm');
  return {
    id: input.accountId ?? `chunithm:lxns:${input.playerId ?? input.displayName}`,
    gameId: 'chunithm',
    providerId: 'lxns',
    displayName: input.displayName,
    scoreLabel: profile.ratingLabel,
    scoreDisplay: input.rating === null || !Number.isFinite(input.rating)
      ? '—'
      : input.rating.toFixed(2),
    providerTitle: (getDataSource('lxns')?.title ?? 'lxns'),
    avatarUrl: input.avatarUrl,
    displayData: { ratingPossession: input.ratingPossession ?? null },
  };
}
