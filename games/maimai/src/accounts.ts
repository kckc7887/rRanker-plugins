import type { BoundAccount } from '@rranker/sdk/account';
import { getDataSource } from '@rranker/sdk/registry';
import { getGameProfile } from '@rranker/sdk/domain/game-profile';
import type { ProviderId } from '@rranker/sdk/plugins';
import { formatPlayerScore } from '@rranker/sdk/data';

export const LOCAL_MAIMAI_ACCOUNT_ID = 'maimai:local';

export const MAIMAI_TEST_ACCOUNT_ID = 'maimai:test';

export function isLocalMaimaiAccountId(accountId: string): boolean {
  return accountId === LOCAL_MAIMAI_ACCOUNT_ID
    || accountId.startsWith(`${LOCAL_MAIMAI_ACCOUNT_ID}:`);
}

export function createAdditionalLocalMaimaiAccountId(
  existingAccountIds: readonly string[],
  now = Date.now(),
): string {
  const base = `${LOCAL_MAIMAI_ACCOUNT_ID}:${now.toString(36)}`;
  let candidate = base;
  let suffix = 2;
  while (existingAccountIds.includes(candidate)) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
  return candidate;
}

export function createLocalMaimaiAccount(
  displayName: string,
  rating: number,
  accountId = LOCAL_MAIMAI_ACCOUNT_ID,
): BoundAccount {
  const profile = getGameProfile('maimai');
  return {
    id: accountId,
    gameId: 'maimai',
    providerId: 'local',
    displayName,
    scoreLabel: profile.ratingLabel,
    scoreDisplay: formatPlayerScore(rating, profile.ratingDigits),
    providerTitle: (getDataSource('local')?.title ?? 'local'),
  };
}

export function createMaxedMaimaiTestAccount(
  rating = 0,
  displayName = '示例账号',
  accountId = MAIMAI_TEST_ACCOUNT_ID,
): BoundAccount {
  const profile = getGameProfile('maimai');
  return {
    id: accountId,
    gameId: 'maimai',
    providerId: 'maimai-test',
    displayName,
    scoreLabel: profile.ratingLabel,
    scoreDisplay: formatPlayerScore(rating, profile.ratingDigits),
    providerTitle: (getDataSource('maimai-test')?.title ?? 'maimai-test'),
  };
}

export function createMaimaiBoundAccount(input: {
  providerId: ProviderId;
  displayName: string;
  rating: number;
  playerId?: string;
  accountId?: string;
}): BoundAccount {
  const profile = getGameProfile('maimai');
  return {
    id: input.accountId ?? `maimai:${input.providerId}:${input.playerId ?? input.displayName}`,
    gameId: 'maimai',
    providerId: input.providerId,
    displayName: input.displayName,
    scoreLabel: profile.ratingLabel,
    scoreDisplay: formatPlayerScore(input.rating, profile.ratingDigits),
    providerTitle: (getDataSource(input.providerId)?.title ?? input.providerId),
  };
}
