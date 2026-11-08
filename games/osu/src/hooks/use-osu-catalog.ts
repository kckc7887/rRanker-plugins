import { getDataSource, usePluginRevision } from '@rranker/sdk/registry';
import type { OsuDataSource } from '../data-source';


import { useMemo } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';

import type { OsuGameId } from '@rranker/game-osu';
import {
  type OsuBeatmapsetSearchParams,
  type OsuCatalogSong,
  type OsuExtraFlag,
  type OsuGeneralFlag,
  type OsuSearchStatus,
} from '@rranker/game-osu/domain/osu';



import { useSession } from '@rranker/sdk/state/session-store';
import { useCachedTabActive } from '@rranker/sdk/components/CachedTabScreen';

export type OsuCatalogSearchInput = {
  q?: string;
  general: readonly OsuGeneralFlag[];
  status: OsuSearchStatus;
  genre: number;
  language: number;
  nsfw: boolean;
  extras: readonly OsuExtraFlag[];
};


export function useOsuCatalogSearch(gameId: OsuGameId | null, input: OsuCatalogSearchInput, enabled = true) {
  const tabActive = useCachedTabActive();
  const activeAccountId = useSession(state => state.activeAccountId);
  const sourcePluginId = useSession(state => state.activeProviderId ? getDataSource(state.activeProviderId)?.id : undefined);
  usePluginRevision();
  const client = useSession(state => state.sourceClient) as OsuDataSource | undefined;
  const demo = !!client?.readDemoPage;
  const bound = gameId !== null && !!client;

  const params = useMemo<OsuBeatmapsetSearchParams | null>(
    () => (gameId === null ? null : { gameId, ...input }),
    [gameId, input],
  );

  const query = useInfiniteQuery({ meta: { pluginId: 'game.osu', sourcePluginId, gameId: gameId ?? undefined, accountId: activeAccountId },
    queryKey: ['osu-catalog-search', gameId, activeAccountId, params] as const,
    queryFn: ({ pageParam, signal }) => client!.searchCatalog(params!, pageParam, signal),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.cursor ?? undefined,
    enabled: enabled && tabActive && bound && params !== null,
    notifyOnChangeProps: tabActive ? undefined : [],
    staleTime: 60_000,
  });

  const songs = useMemo(() => {
    const seen = new Set<number>();
    const list: OsuCatalogSong[] = [];
    for (const page of query.data?.pages ?? []) {
      for (const song of page.songs) {
        if (seen.has(song.beatmapSetId)) continue;
        seen.add(song.beatmapSetId);
        list.push(song);
      }
    }
    return list;
  }, [query.data]);

  const total = query.data?.pages[0]?.total;
  const recommendedDifficulty = query.data?.pages[0]?.recommendedDifficulty ?? null;

  return {
    ...query,
    bound,
    demo,
    songs,
    total,
    recommendedDifficulty,
  };
}
