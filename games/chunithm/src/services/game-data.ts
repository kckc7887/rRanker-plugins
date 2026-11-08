import type { GameDataLoaderContext, GameDataLoadResult } from '@rranker/sdk/data-load';
import { emptyGamePayload, type GameDataBundle } from '@rranker/sdk/data';
import type { ChunithmDataSource } from '../data-source';
import type { ChunithmPersonalSnapshot } from '../domain/chunithm-personal';
import { getGameProfile } from '@rranker/sdk/domain/game-profile';
import { ProviderError } from '@rranker/sdk/providers/errors';

export async function loadData(context: GameDataLoaderContext): Promise<GameDataLoadResult> {
  const client = context.client as ChunithmDataSource | undefined;
  const profile = getGameProfile('chunithm');
  if (!client) return { bundle: { gameId: 'chunithm', providerId: context.activeProviderId, profile,
    payload: emptyGamePayload('chunithm', '临时账号') } };
  const toBundle = (snapshot: ChunithmPersonalSnapshot): GameDataBundle => ({ gameId: 'chunithm', providerId: context.activeProviderId, profile,
    payload: { kind: 'chunithm', player: snapshot.player, scores: snapshot.scores,
      bestSections: [{ id: 'b30', title: 'Best 30', scores: snapshot.bests.bests },
        { id: 'new20', title: 'New 20', scores: snapshot.bests.new_bests }], selections: snapshot.bests.selections,
      playerScore: { label: 'RATING', value: snapshot.player?.rating ?? 0, display: snapshot.player ? snapshot.player.rating.toFixed(2) : '—' },
      source: snapshot.source, hasSyncedData: snapshot.player !== null } });
  const cached = context.hasSessionData ? null : await client.readCached();
  context.assertCurrent();
  if (cached) return { bundle: toBundle(cached) };
  const result = await client.readFresh(context);
  context.assertCurrent();
  if (result.status === 'cancelled') throw context.signal.reason ?? new Error('中二个人成绩刷新已取消');
  if (!result.value) {
    const failure = result.failures[0];
    throw failure ? new ProviderError(failure.code, failure.diagnostic, failure.retryable) : new Error('中二个人成绩读取失败');
  }
  const bundle = toBundle(result.value);
  return { bundle, background: Promise.resolve({ ...result, value: bundle }) };
}
