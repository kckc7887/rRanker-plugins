import type { BoundAccount } from '@rranker/sdk/account';
import type { AccountCleanupAttempt } from '@rranker/sdk/plugins';
import { osuUserIdFromAccountId } from '@rranker/game-osu/accounts';
import { isOsuGameId } from '@rranker/game-osu';
import { OsuCache } from './services/osu-cache';
const cache = new OsuCache();
export async function cleanupAccount(account: BoundAccount, cleanup: AccountCleanupAttempt): Promise<void> {
  const userId = osuUserIdFromAccountId(account.id);
  const gameId = account.gameId;
  if (userId !== null && isOsuGameId(gameId)) await cleanup('模式缓存', () => cache.clear(gameId, userId));
}
