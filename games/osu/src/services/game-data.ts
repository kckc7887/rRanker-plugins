import type { GameDataLoaderContext, GameDataLoadResult } from '@rranker/sdk/data-load';
import { emptyGamePayload } from '@rranker/sdk/data';
import type { OsuDataSource } from '../data-source';
import { osuPayloadFromSnapshot } from '../domain/game-data';
import { isOsuGameId } from '../index';
import { getGameProfile } from '@rranker/sdk/domain/game-profile';
import { staleCached } from '@rranker/sdk/services/cache-first';
import { recordRuntimeDiagnostic } from '@rranker/sdk/services/runtime-diagnostics-recorder';

export async function loadData(context: GameDataLoaderContext): Promise<GameDataLoadResult> {
  const gameId = context.activeGameId;
  if (!isOsuGameId(gameId)) throw new Error('osu 加载器收到非 osu 游戏');
  const profile = getGameProfile(gameId), client = context.client as OsuDataSource | undefined;
  if (!client) return { bundle: { gameId, providerId: context.activeProviderId, profile, payload: emptyGamePayload(gameId, '未绑定 osu! 账号') } };
  const stored = context.hasSessionData ? null : await client.readCached();
  const snapshot = stored ? staleCached(stored) : await client.readFresh(context.signal);
  context.assertCurrent();
  if (!stored && client.persist) void client.persist(snapshot, context.assertCurrent).catch(error =>
    recordRuntimeDiagnostic('operation', { source: 'game-data', gameType: gameId, phase: 'cache-persist', result: context.signal.aborted ? 'cancelled' : 'failed', error }));
  return { bundle: { gameId, providerId: context.activeProviderId, profile, payload: osuPayloadFromSnapshot(snapshot, profile) } };
}
