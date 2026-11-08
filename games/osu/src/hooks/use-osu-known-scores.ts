import { getDataSource, usePluginRevision } from '@rranker/sdk/registry';
import type { OsuDataSource } from '../data-source';


import { useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import type { OsuGameId } from '@rranker/game-osu';
import {
  type OsuBeatmapsetDetail,
  type OsuBestScore,
  type OsuKnownScoresSnapshot,
} from '@rranker/game-osu/domain/osu';



import { queryClient } from '@rranker/sdk/state/query-client';
import { useSession } from '@rranker/sdk/state/session-store';
import { useCachedTabActive } from '@rranker/sdk/components/CachedTabScreen';
import { captureResourceWrites } from '@rranker/sdk/services/snapshot-cache-utils';
import { loadItemsBounded } from '@rranker/sdk/services/offset-pagination';


const EMPTY_SCORES: readonly OsuBestScore[] = [];

export function osuKnownScoresQueryKey(
  activeAccountId: string | null,
  gameId: OsuGameId | null,
  userId: number | null,
) {
  return ['osu-known-scores', activeAccountId, gameId, userId] as const;
}

export function useOsuKnownScores(
  gameId: OsuGameId | null,
  seedScores: readonly OsuBestScore[] = EMPTY_SCORES,
  enabled = true,
) {
  const tabActive = useCachedTabActive();
  const activeAccountId = useSession(state => state.activeAccountId);
  const sourcePluginId = useSession(state => state.activeProviderId ? getDataSource(state.activeProviderId)?.id : undefined);
  usePluginRevision();
  const client = useSession(state => state.sourceClient) as OsuDataSource | undefined;
  const userId = client?.userId ?? null;
  const bound = gameId !== null && !!client?.getBeatmapScore && userId !== null;
  const key = useMemo(
    () => osuKnownScoresQueryKey(activeAccountId, gameId, userId),
    [activeAccountId, gameId, userId],
  );

  const query = useQuery({ meta: { pluginId: 'game.osu', sourcePluginId, gameId: gameId ?? undefined, accountId: activeAccountId },
    queryKey: key,
    queryFn: () => client!.readKnownScores!(),
    enabled: enabled && tabActive && bound,
    notifyOnChangeProps: tabActive ? undefined : [],
    staleTime: 60_000,
  });

  useEffect(() => {
    if (!enabled || !tabActive || !bound || gameId === null || userId === null || seedScores.length === 0) return;
    const controller = new AbortController();
    const assertCurrent = captureResourceWrites(gameId, controller.signal, activeAccountId ?? undefined);
    void client!.mergeKnownScores!(seedScores, assertCurrent).then((snapshot) => {
      assertCurrent();
      queryClient.setQueryData(key, snapshot);
    }).catch(() => undefined);
    return () => { controller.abort(); };
  }, [activeAccountId, bound, client, enabled, gameId, key, seedScores, tabActive, userId]);

  const scores = useMemo(
    () => Object.values(query.data?.items ?? {}),
    [query.data?.items],
  );
  return { ...query, data: scores, snapshot: query.data, bound };
}

export function useOsuBeatmapsetUserScores(
  gameId: OsuGameId,
  song: OsuBeatmapsetDetail | null,
) {
  const active = useCachedTabActive();
  const activeAccountId = useSession(state => state.activeAccountId);
  const sourcePluginId = useSession(state => state.activeProviderId ? getDataSource(state.activeProviderId)?.id : undefined);
  usePluginRevision();
  const client = useSession(state => state.sourceClient) as OsuDataSource | undefined;
  const userId = client?.userId ?? null;
  const bound = !!client?.getBeatmapScore && userId !== null;

  return useQuery({ meta: { pluginId: 'game.osu', sourcePluginId, gameId: gameId ?? undefined, accountId: activeAccountId },
    queryKey: [
      'osu-beatmapset-user-scores',
      activeAccountId,
      gameId,
      userId,
      song?.beatmapSetId ?? null,
    ] as const,
    queryFn: async ({ signal }): Promise<OsuBestScore[]> => {
      const assertCurrent = captureResourceWrites(gameId, signal, activeAccountId ?? undefined);
      const currentSong = song as OsuBeatmapsetDetail;
      const scoresById = new Map<number, OsuBestScore>();
      const failures = await loadItemsBounded({
        items: currentSong.beatmaps, concurrency: 4, signal,
        onItem: (score: OsuBestScore | null, beatmap) => { if (score) scoresById.set(beatmap.id, score); },
        load: beatmap => client!.getBeatmapScore!(currentSong, beatmap, signal),
      });
      const scores = currentSong.beatmaps.flatMap(beatmap => {
        const score = scoresById.get(beatmap.id);
        return score ? [score] : [];
      });
      if (scores.length > 0 && !signal.aborted) {
        const snapshot = await client!.mergeKnownScores!(scores, assertCurrent);
        assertCurrent();
        queryClient.setQueryData<OsuKnownScoresSnapshot>(
          osuKnownScoresQueryKey(activeAccountId, gameId, userId),
          snapshot,
        );
      }
      if (signal.aborted) throw signal.reason ?? new Error('操作已取消');
      if (failures.length) throw failures[0].error;
      return scores;
    },
    enabled: active && bound && song !== null && song.beatmaps.length > 0,
    notifyOnChangeProps: active ? undefined : [],
    staleTime: 60_000,
  });
}
