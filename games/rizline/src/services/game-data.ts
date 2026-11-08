import type { GameDataLoaderContext, GameDataLoadResult } from '@rranker/sdk/data-load';
import { emptyGamePayload, type GameDataBundle } from '@rranker/sdk/data';
import type { RizlineDataSource } from '../data-source';
import type { RizlineCatalogData, RizlineSnapshot } from '../domain/rizline';
import { rizlinePayloadFromSnapshot } from '../domain/game-data';
import { ensureRizlineCatalog, RIZLINE_CATALOG_QUERY_KEY } from '@rranker/game-rizline/services/rizline-catalog-query';
import { cacheFirstLoadWithBackground, staleCached } from '@rranker/sdk/services/cache-first';
import { gameDataBackground } from '@rranker/sdk/services/game-data-query';
import { getGameProfile } from '@rranker/sdk/domain/game-profile';

export async function loadData(context: GameDataLoaderContext): Promise<GameDataLoadResult> {
  const { hasSessionData, signal, assertCurrent, publish, readEntityValue } = context;
  const profile = getGameProfile('rizline'), client = context.client as RizlineDataSource | undefined;
  const catalog = await ensureRizlineCatalog(context.queryClient).catch(() => undefined);
  assertCurrent();
  const toBundle = (snapshot: RizlineSnapshot): GameDataBundle => ({ gameId: 'rizline', providerId: context.activeProviderId, profile,
    payload: rizlinePayloadFromSnapshot(snapshot, readEntityValue<RizlineCatalogData>(RIZLINE_CATALOG_QUERY_KEY) ?? catalog) });
  if (!client?.readFresh) {
    const cached = await client?.readCached();
    assertCurrent();
    return { bundle: cached ? toBundle({ ...staleCached(cached), requiresLogin: true }) : {
      gameId: 'rizline', providerId: context.activeProviderId, profile, payload: emptyGamePayload('rizline', '请登录账号') } };
  }
  const fresh = (requestSignal: AbortSignal) => client.readFresh!({ queryClient: context.queryClient, signal: requestSignal });
  if (hasSessionData) { const snapshot = await fresh(signal); assertCurrent(); return { bundle: toBundle(snapshot) }; }
  const load = await cacheFirstLoadWithBackground({ loadCached: client.readCached, loadFresh: fresh, signal, assertCurrent,
    onFresh: value => publish(toBundle(value)), onFallback: value => { if (value.requiresLogin) return publish(toBundle(value)); } });
  assertCurrent();
  return { bundle: toBundle(load.value), background: gameDataBackground(load.background, toBundle) };
}
