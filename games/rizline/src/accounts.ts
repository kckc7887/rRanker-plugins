import type { BoundAccount } from '@rranker/sdk/account';
import { getDataSource } from '@rranker/sdk/registry';
import { getGameProfile } from '@rranker/sdk/domain/game-profile';

export function createRizlineBoundAccount(input: {
  userId: string; username: string; totalRks?: number | null;
}): BoundAccount {
  return {
    id: `rizline:official:${input.userId}`,
    gameId: 'rizline',
    providerId: 'rizline-official',
    displayName: input.username,
    scoreLabel: getGameProfile('rizline').ratingLabel,
    scoreDisplay: input.totalRks == null || !Number.isFinite(input.totalRks) ? '—' : input.totalRks.toFixed(4),
    providerTitle: (getDataSource('rizline-official')?.title ?? 'rizline-official'),
  };
}

export function rizlineUserIdFromAccountId(accountId: string): string | null {
  const prefix = 'rizline:official:';
  return accountId.startsWith(prefix) && accountId.length > prefix.length ? accountId.slice(prefix.length) : null;
}
