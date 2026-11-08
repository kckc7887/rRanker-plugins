import type { BoundAccount } from '@rranker/sdk/account';
import { getDataSource } from '@rranker/sdk/registry';
import { getGameProfile } from '@rranker/sdk/domain/game-profile';

export const PHIGROS_TEST_ACCOUNT_ID = 'phigros:test';

export function createMaxedPhigrosTestAccount(
  rating = 0,
  displayName = '示例账号',
): BoundAccount {
  const profile = getGameProfile('phigros');
  return {
    id: PHIGROS_TEST_ACCOUNT_ID,
    gameId: 'phigros',
    providerId: 'phigros-test',
    displayName,
    scoreLabel: profile.ratingLabel,
    scoreDisplay: Number.isFinite(rating) ? rating.toFixed(4) : '—',
    providerTitle: (getDataSource('phigros-test')?.title ?? 'phigros-test'),
    displayData: { challengeModeRank: null },
  };
}

export function createPhigrosBoundAccount(input: {
  openid: string;
  displayName: string;
  rating: number;
  challengeModeRank?: number | null;
}): BoundAccount {
  const profile = getGameProfile('phigros');
  return {
    id: `phigros:phi-taptap:${input.openid}`,
    gameId: 'phigros',
    providerId: 'phi-taptap',
    displayName: input.displayName,
    scoreLabel: profile.ratingLabel,
    scoreDisplay: Number.isFinite(input.rating) ? input.rating.toFixed(4) : '—',
    providerTitle: (getDataSource('phi-taptap')?.title ?? 'phi-taptap'),
    displayData: { challengeModeRank: input.challengeModeRank ?? null },
  };
}
