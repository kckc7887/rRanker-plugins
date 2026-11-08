import type { BoundAccount } from '@rranker/sdk/account';
import { getDataSource } from '@rranker/sdk/registry';
import { getGameProfile } from '@rranker/sdk/domain/game-profile';

/** 示例 ID 含非 hex 字符，与真实 user_id 区分。 */
export const MUSEDASH_TEST_USER_ID = 'rranker-demo-maxed';

export const MUSEDASH_TEST_ACCOUNT_ID = `musedash:musedash-moe:${MUSEDASH_TEST_USER_ID}`;

export function isMuseDashTestUserId(userId: string): boolean {
  return userId === MUSEDASH_TEST_USER_ID;
}

export function museDashUserIdFromAccountId(accountId: string): string | null {
  const match = /^musedash:musedash-moe:(.+)$/.exec(accountId);
  return match ? match[1] : null;
}

export function createMuseDashBoundAccount(input: {
  userId: string;
  displayName: string;
  rl?: number | null;
}): BoundAccount {
  const profile = getGameProfile('musedash');
  return {
    id: `musedash:musedash-moe:${input.userId}`,
    gameId: 'musedash',
    providerId: 'musedash-moe',
    displayName: input.displayName,
    scoreLabel: profile.ratingLabel,
    scoreDisplay: input.rl == null || !Number.isFinite(input.rl) ? '—' : input.rl.toFixed(2),
    providerTitle: (getDataSource('musedash-moe')?.title ?? 'musedash-moe'),
  };
}

export function createMaxedMuseDashTestAccount(
  rl = 0,
  displayName = '示例账号',
): BoundAccount {
  const profile = getGameProfile('musedash');
  return {
    id: MUSEDASH_TEST_ACCOUNT_ID,
    gameId: 'musedash',
    providerId: 'musedash-test',
    displayName,
    scoreLabel: profile.ratingLabel,
    scoreDisplay: Number.isFinite(rl) ? rl.toFixed(2) : '—',
    providerTitle: (getDataSource('musedash-test')?.title ?? 'musedash-test'),
  };
}
