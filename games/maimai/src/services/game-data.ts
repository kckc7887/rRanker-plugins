import { getGameResourceSource } from '@rranker/sdk/registry';
import { captureResourceWrites, subscribeResourceWrites } from '@rranker/sdk/services/snapshot-cache-utils';
import type { GameDataLoaderContext, GameDataLoadResult } from '@rranker/sdk/data-load';
import { emptyGamePayload, type GameDataBundle } from '@rranker/sdk/data';
import type { MaimaiDataSource } from '../data-source';
import { maimaiPayloadFromSnapshot } from '../domain/game-data';
import { getGameProfile } from '@rranker/sdk/domain/game-profile';
import { ensureMaimaiCatalog } from '@rranker/game-maimai/services/maimai-catalog-query';
import { ScoreService, staleCachedSnapshot } from '@rranker/game-maimai/services/score-service';
import type { ScoreSnapshot } from '@rranker/game-maimai/domain/models';
import { ScoreRepository } from '@rranker/game-maimai/storage/score-repository';

const repository = new ScoreRepository();

export async function loadData(context: GameDataLoaderContext): Promise<GameDataLoadResult> {
  const { activeAccountId, activeProviderId, activeAccount, signal } = context;
  const client = context.client as MaimaiDataSource | undefined;
  const profile = getGameProfile('maimai');
  if (!client) return { bundle: { gameId: 'maimai', providerId: activeProviderId, profile,
    payload: emptyGamePayload('maimai', '未绑定账号') } };
  if (activeAccount?.scoreDisplay === '—' && client.getOptionalPlayer && await client.getOptionalPlayer(signal) === null) {
    return { bundle: { gameId: 'maimai', providerId: activeProviderId, profile,
      payload: emptyGamePayload('maimai', activeAccount.displayName) } };
  }
  const { scoreProvider, catalogProvider, persistScores } = client;
  const resourceSource = getGameResourceSource('maimai');
  const service = new ScoreService(scoreProvider, catalogProvider, activeAccountId, persistScores,
    async (detailed, catalogSignal) => {
      if (!resourceSource) throw new Error('舞萌曲库来源不可用');
      const controller = new AbortController();
      const cancel = () => controller.abort(catalogSignal.reason ?? new Error('曲库请求已取消'));
      catalogSignal.addEventListener('abort', cancel, { once: true });
      const unsubscribe = subscribeResourceWrites(resourceSource.id, cancel);
      const assertCurrent = captureResourceWrites(resourceSource.id, controller.signal);
      try {
        if (catalogSignal.aborted) cancel();
        assertCurrent();
        const catalog = await (detailed ? catalogProvider.getDetailedCatalog(controller.signal)
          : ensureMaimaiCatalog(context.queryClient, catalogProvider, controller.signal));
        assertCurrent();
        return catalog;
      } finally {
        catalogSignal.removeEventListener('abort', cancel);
        unsubscribe();
      }
    });
  const toBundle = (snapshot: ScoreSnapshot): GameDataBundle => ({ gameId: 'maimai', providerId: activeProviderId,
    profile, payload: maimaiPayloadFromSnapshot(snapshot, profile) });
  if (persistScores && !context.hasSessionData) {
    const cached = await repository.getLatest(activeAccountId);
    if (cached) {
      if (!client.local) return { bundle: toBundle(staleCachedSnapshot(cached)) };
      const displayName = activeAccount?.displayName ?? cached.player.displayName;
      return { bundle: toBundle({ ...cached, player: { ...cached.player, displayName },
        best50: { ...cached.best50, player: { ...cached.best50.player, displayName } } }) };
    }
  }
  return { bundle: toBundle(await service.load(signal)) };
}
