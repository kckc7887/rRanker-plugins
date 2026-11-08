import type { SourceSyncContext } from '@rranker/sdk/data-load';
import type { AccountSummary } from '@rranker/sdk/data';
import { tufPlayerIdFromAccountId } from '@rranker/game-adofai/accounts';
import { resolveTufAvatarUrl } from '@rranker/game-adofai/domain/tuf';
import { loadTufPlayerFresh, makeTufSnapshot, TufCache } from '@rranker/provider-tuf/services/tuf-cache';
import { loadBoundAccountThumbnail } from '@rranker/sdk/services/account-thumbnail';
import { recordRuntimeDiagnostic } from '@rranker/sdk/services/runtime-diagnostics-recorder';

const cache = new TufCache();
export async function hydrateAccount({ account, signal, assertCurrent }: SourceSyncContext): Promise<AccountSummary | undefined> {
  const persisted = await loadBoundAccountThumbnail(account.id);
  assertCurrent();
  if (persisted?.avatarUrl) return { scoreDisplay: account.scoreDisplay, avatarUrl: persisted.avatarUrl };
  const playerId = tufPlayerIdFromAccountId(account.id);
  if (playerId === null) return;
  const cached = resolveTufAvatarUrl((await cache.loadPlayer(playerId))?.data);
  assertCurrent();
  if (cached) return { scoreDisplay: account.scoreDisplay, avatarUrl: cached };
  const player = await loadTufPlayerFresh(playerId, signal);
  assertCurrent();
  await cache.savePlayer(playerId, makeTufSnapshot(player), assertCurrent).catch(error =>
    recordRuntimeDiagnostic('operation', { source: 'account-avatar', gameType: 'adofai', phase: 'cache-persist', result: signal.aborted ? 'cancelled' : 'failed', error }));
  return { scoreDisplay: account.scoreDisplay, avatarUrl: resolveTufAvatarUrl(player) };
}
