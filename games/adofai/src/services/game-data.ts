import type { QueryClient } from '@tanstack/react-query';
import type { GameDataLoaderContext, GameDataLoadResult } from '@rranker/sdk/data-load';
import { emptyGamePayload } from '@rranker/sdk/data';
import type { AdofaiDataSource } from '../data-source';
import type { TufPlayerSnapshot } from '../domain/tuf';
import { getGameProfile } from '@rranker/sdk/domain/game-profile';
import { staleCached } from '@rranker/sdk/services/cache-first';
import { recordRuntimeDiagnostic } from '@rranker/sdk/services/runtime-diagnostics-recorder';

export async function loadData(context: GameDataLoaderContext): Promise<GameDataLoadResult> {
  const client = context.client as AdofaiDataSource | undefined, profile = getGameProfile('adofai');
  if (!client) return { bundle: { gameId: 'adofai', providerId: context.activeProviderId, profile,
    payload: emptyGamePayload('adofai', '未绑定玩家') } };
  const committed = context.hasSessionData ? undefined : context.readEntityValue<TufPlayerSnapshot>(client.entityKey);
  const stored = committed === undefined && !context.hasSessionData ? await client.readCached() : null;
  const fresh = committed === undefined && stored === null;
  const snapshot = committed ?? (stored ? staleCached(stored) : await client.readFresh(context.signal));
  context.assertCurrent();
  if (fresh) {
    context.publishEntityValue(client.entityKey, snapshot);
    if (client.persist) void client.persist(snapshot, context.assertCurrent).catch(error =>
      recordRuntimeDiagnostic('operation', { source: 'game-data', gameType: 'adofai', phase: 'cache-persist', result: context.signal.aborted ? 'cancelled' : 'failed', error }));
  }
  const player = snapshot.data;
  return { bundle: { gameId: 'adofai', providerId: context.activeProviderId, profile, payload: { kind: 'adofai', player,
    playerScore: client.playerScore ?? { label: 'RANKED SCORE', value: player.rankedScore, display: Number.isFinite(player.rankedScore) ? player.rankedScore.toFixed(2) : '—' },
    source: snapshot.source } } };
}

export async function invalidateTufDifficulties(client: QueryClient): Promise<void> {
  await client.invalidateQueries({ queryKey: ['tuf', 'difficulties'], refetchType: 'active' });
}
