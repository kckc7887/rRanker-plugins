import type { QueryClient } from '@tanstack/react-query';
import type { GameDataLoaderContext, GameDataLoadResult } from '@rranker/sdk/data-load';
import { emptyGamePayload, type GameDataBundle } from '@rranker/sdk/data';
import type { MajdataDataSource } from '../data-source';
import { majdataTotal, majdataTotalText, type MajdataSnapshot } from '../domain/majdata';
import { cacheFirstLoadWithBackground, staleCached } from '@rranker/sdk/services/cache-first';
import { gameDataBackground } from '@rranker/sdk/services/game-data-query';
import { getGameProfile } from '@rranker/sdk/domain/game-profile';

export async function loadData(context: GameDataLoaderContext): Promise<GameDataLoadResult> {
  const { hasSessionData, signal, assertCurrent, publish, invalidateEntityValue } = context;
  const profile = getGameProfile('majdata-net'), client = context.client as MajdataDataSource | undefined;
  const toBundle = (snapshot: MajdataSnapshot): GameDataBundle => ({ gameId: 'majdata-net', providerId: context.activeProviderId, profile,
    payload: { kind: 'majdata-net', snapshot, source: snapshot.source,
      playerScore: client?.playerScore ?? { label: 'DX · Classic', value: majdataTotal(snapshot.records), display: majdataTotalText(snapshot) } } });
  if (!client?.readFresh) {
    const cached = await client?.readCached();
    assertCurrent();
    return { bundle: cached ? toBundle(staleCached(cached)) : { gameId: 'majdata-net', providerId: context.activeProviderId,
      profile, payload: emptyGamePayload('majdata-net', '请登录账号') } };
  }
  const fresh = async (requestSignal: AbortSignal) => {
    try {
      const result = await client.readFresh!(requestSignal);
      invalidateEntityValue(['majdata-net', 'ranking', context.activeAccountId]);
      return result;
    } catch (error) {
      const cached = await client.readCached();
      if (cached && !requestSignal.aborted) return staleCached(cached);
      throw error;
    }
  };
  if (hasSessionData) { const snapshot = await fresh(signal); assertCurrent(); return { bundle: toBundle(snapshot) }; }
  const load = await cacheFirstLoadWithBackground({ loadCached: client.readCached, loadFresh: fresh, signal, assertCurrent,
    onFresh: value => publish(toBundle(value)) });
  assertCurrent();
  return { bundle: toBundle(load.value), background: gameDataBackground(load.background, toBundle) };
}

export async function invalidateMajdataCatalog(client: QueryClient): Promise<void> {
  await client.invalidateQueries({ queryKey: ['majdata-net', 'catalog'], refetchType: 'active' });
}
