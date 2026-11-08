import type { GameDataLoaderContext, GameDataLoadResult } from '@rranker/sdk/data-load';
import { emptyGamePayload } from '@rranker/sdk/data';
import type { PhiraDataSource } from '../data-source';
import type { PhiraPlayerSnapshot, PhiraBestSnapshot } from '../domain/phira';
import { getGameProfile } from '@rranker/sdk/domain/game-profile';
import { staleCached } from '@rranker/sdk/services/cache-first';

export async function loadData(context: GameDataLoaderContext): Promise<GameDataLoadResult> {
  const client = context.client as PhiraDataSource | undefined, profile = getGameProfile('phira');
  if (!client) return { bundle: { gameId: 'phira', providerId: context.activeProviderId, profile, payload: emptyGamePayload('phira', '未绑定玩家') } };
  const committed = context.hasSessionData ? undefined : context.readEntityValue<PhiraPlayerSnapshot>(client.playerKey);
  const stored = committed === undefined && !context.hasSessionData ? await client.readCached() : null;
  const fresh = committed === undefined && stored === null;
  const snapshot = committed ?? (stored ? staleCached(stored) : await client.readFresh(context.signal));
  context.assertCurrent();
  if (fresh) {
    context.publishEntityValue(client.playerKey, snapshot);
    if (client.refreshBests) void client.refreshBests(snapshot, context.signal).then(bests => {
      context.assertCurrent();
      if (bests) context.publishEntityValue(client.bestsKey, bests);
    }).catch(() => undefined);
  }
  const bests = context.readEntityValue<PhiraBestSnapshot>(client.bestsKey) ?? await client.readBests();
  context.assertCurrent();
  return { bundle: { gameId: 'phira', providerId: context.activeProviderId, profile, payload: { kind: 'phira', snapshot, bests,
    playerScore: { label: 'Ranking Score', value: snapshot.player.rks, display: snapshot.player.rks.toFixed(profile.ratingDigits) }, source: snapshot.source } } };
}
