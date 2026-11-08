import { getDataSource, usePluginRevision } from '@rranker/sdk/registry';
import type { OsuDataSource } from '../data-source';

import { useQuery } from '@tanstack/react-query';
import { useCachedTabActive } from '@rranker/sdk/components/CachedTabScreen';
import type { OsuGameId } from '@rranker/game-osu';
import { useSession } from '@rranker/sdk/state/session-store';

export function useOsuBeatmapsetDetail(gameId: OsuGameId | null, beatmapsetId: string | null) {
  const active = useCachedTabActive();
  const activeAccountId = useSession(state => state.activeAccountId);
  const sourcePluginId = useSession(state => state.activeProviderId ? getDataSource(state.activeProviderId)?.id : undefined);
  usePluginRevision();
  const client = useSession(state => state.sourceClient) as OsuDataSource | undefined;
  const bound = gameId !== null && !!client;
  const query = useQuery({
    meta: { pluginId: 'game.osu', sourcePluginId, gameId: gameId ?? undefined, accountId: activeAccountId },
    queryKey: ['osu-beatmapset-detail', gameId, activeAccountId, beatmapsetId] as const,
    queryFn: ({ signal }) => client!.getBeatmapset(beatmapsetId!, signal),
    enabled: active && bound && beatmapsetId !== null,
    notifyOnChangeProps: active ? undefined : [], staleTime: 60_000,
  });
  return { ...query, bound };
}
