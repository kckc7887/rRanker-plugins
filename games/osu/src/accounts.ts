import type { BoundAccount } from '@rranker/sdk/account';
import { getDataSource } from '@rranker/sdk/registry';
import { getGameProfile } from '@rranker/sdk/domain/game-profile';
import type { OsuGameId } from './index';

/** osu! 各模式分别绑定账号，共用凭据。 */
export function createOsuBoundAccount(input: {
  gameId: OsuGameId;
  userId: number;
  displayName: string;
  pp: number | null;
  avatarUrl?: string | null;
}): BoundAccount {
  const profile = getGameProfile(input.gameId);
  return {
    id: `${input.gameId}:osu:${input.userId}`,
    gameId: input.gameId,
    providerId: 'osu',
    displayName: input.displayName,
    scoreLabel: profile.ratingLabel,
    /** scoreDisplay 回读时使用 Number()，不能带千分位。 */
    scoreDisplay: input.pp == null || !Number.isFinite(input.pp) ? '—' : String(Math.round(input.pp)),
    providerTitle: (getDataSource('osu')?.title ?? 'osu'),
    avatarUrl: input.avatarUrl,
  };
}

export function osuUserIdFromAccountId(accountId: string): number | null {
  const match = /^osu-(standard|mania|catch|taiko):osu:(\d+)$/.exec(accountId);
  if (!match) return null;
  const userId = Number(match[2]);
  return Number.isSafeInteger(userId) && userId > 0 ? userId : null;
}
