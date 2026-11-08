import type { GameDataLoaderContext, GameDataLoadResult } from '@rranker/sdk/data-load';
import { emptyGamePayload } from '@rranker/sdk/data';
import type { MuseDashDataSource } from '../data-source';
import type { MuseDashPlayerSnapshot } from '../domain/muse-dash';
import { getGameProfile } from '@rranker/sdk/domain/game-profile';
import { staleCached } from '@rranker/sdk/services/cache-first';
import { recordRuntimeDiagnostic } from '@rranker/sdk/services/runtime-diagnostics-recorder';

export async function loadData(context: GameDataLoaderContext): Promise<GameDataLoadResult> {
  const client = context.client as MuseDashDataSource | undefined, profile = getGameProfile('musedash');
  if (!client) return { bundle: { gameId: 'musedash', providerId: context.activeProviderId, profile,
    payload: emptyGamePayload('musedash', '未绑定玩家') } };
  const committed = context.hasSessionData ? undefined : context.readEntityValue<MuseDashPlayerSnapshot>(client.entityKey);
  const stored = committed === undefined && !context.hasSessionData ? await client.readCached() : null;
  const fresh = committed === undefined && stored === null;
  const snapshot = committed ?? (stored ? staleCached(stored) : await client.readFresh(context));
  context.assertCurrent();
  if (fresh) {
    context.publishEntityValue(client.entityKey, snapshot);
    if (client.persist) void client.persist(snapshot, context.assertCurrent).catch(error =>
      recordRuntimeDiagnostic('operation', { source: 'game-data', gameType: 'musedash', phase: 'cache-persist', result: context.signal.aborted ? 'cancelled' : 'failed', error }));
  }
  const player = snapshot.data;
  return { bundle: { gameId: 'musedash', providerId: context.activeProviderId, profile, payload: { kind: 'musedash', player,
    playerScore: { label: 'Rating', value: player.rl ?? 0, display: player.rl == null || !Number.isFinite(player.rl) ? '—' : player.rl.toFixed(2) }, source: snapshot.source } } };
}
