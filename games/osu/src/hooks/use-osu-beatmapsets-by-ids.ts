import { getDataSource, usePluginRevision } from '@rranker/sdk/registry';
import type { OsuDataSource } from '../data-source';

import { useMemo } from 'react';
import { useBoundedQueries } from '@rranker/sdk/hooks/use-bounded-queries';
import type { OsuGameId } from '@rranker/game-osu';
import type { OsuBeatmapsetDetail } from '../domain/osu';
import { useSession } from '@rranker/sdk/state/session-store';

export function useOsuBeatmapsetsByIds(gameId: OsuGameId, beatmapsetIds: readonly string[]) {
  const activeAccountId = useSession(state => state.activeAccountId);
  const sourcePluginId = useSession(state => state.activeProviderId ? getDataSource(state.activeProviderId)?.id : undefined);
  usePluginRevision();
  const client = useSession(state => state.sourceClient) as OsuDataSource | undefined;
  const bound = !!client;
  const serializedIds = JSON.stringify([...new Set(beatmapsetIds.map(String).filter(Boolean))]);
  const uniqueIds = useMemo<string[]>(() => JSON.parse(serializedIds), [serializedIds]);
  const options = useMemo(() => uniqueIds.map(beatmapsetId => ({
    meta: { pluginId: 'game.osu', sourcePluginId, gameId, accountId: activeAccountId },
    queryKey: ['osu-beatmapset-detail', gameId, activeAccountId, beatmapsetId] as const,
    queryFn: ({ signal }: { signal: AbortSignal }) => client!.getBeatmapset(beatmapsetId, signal),
    staleTime: 60_000,
  })), [activeAccountId, client, gameId, sourcePluginId, uniqueIds]);
  const { queries } = useBoundedQueries(options, 4, bound);
  const data = useMemo(() => {
    const map = new Map<string, OsuBeatmapsetDetail>();
    queries.forEach((query, index) => { if (query.data) map.set(uniqueIds[index], query.data); });
    return map;
  }, [queries, uniqueIds]);
  return { data, bound, isLoading: queries.some(query => query.isLoading), isError: queries.some(query => query.isError) };
}
