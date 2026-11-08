import type { BoundAccount } from '@rranker/sdk/account';
import { getDataSource } from '@rranker/sdk/registry';
import { getGameProfile } from '@rranker/sdk/domain/game-profile';
import { majdataAvatarUrl } from './domain/majdata';

export function createMajdataBoundAccount(input: {
  accountId: string; displayName: string; scoreDisplay?: string; avatarUrl?: string | null;
}): BoundAccount {
  return {
    id: input.accountId,
    gameId: 'majdata-net',
    providerId: 'majdata-net',
    displayName: input.displayName,
    scoreLabel: getGameProfile('majdata-net').ratingLabel,
    scoreDisplay: input.scoreDisplay ?? '—',
    providerTitle: (getDataSource('majdata-net')?.title ?? 'majdata-net'),
    avatarUrl: input.avatarUrl ?? majdataAvatarUrl(input.displayName),
  };
}
