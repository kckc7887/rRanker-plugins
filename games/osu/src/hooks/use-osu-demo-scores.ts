import { getDataSource, usePluginRevision } from '@rranker/sdk/registry';
import type { OsuDataSource } from '../data-source';

import { useMemo } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useCachedTabActive } from '@rranker/sdk/components/CachedTabScreen';
import type { OsuGameId } from '@rranker/game-osu';
import { useSession } from '@rranker/sdk/state/session-store';

export function useOsuDemoScores(gameId: OsuGameId | null, enabled = true) {
  const active = useCachedTabActive();
  const activeAccountId = useSession(state => state.activeAccountId);
  const sourcePluginId = useSession(state => state.activeProviderId ? getDataSource(state.activeProviderId)?.id : undefined);
  usePluginRevision();
  const client = useSession(state => state.sourceClient) as OsuDataSource | undefined;
  const bound = gameId !== null && !!client?.readDemoPage;
  const query = useInfiniteQuery({
    meta: { pluginId: 'game.osu', sourcePluginId, gameId: gameId ?? undefined, accountId: activeAccountId },
    queryKey: ['osu-demo-scores', activeAccountId, gameId] as const,
    queryFn: ({ pageParam, signal }) => client!.readDemoPage!(pageParam, signal),
    initialPageParam: 0, getNextPageParam: last => last.nextPage,
    enabled: enabled && active && bound, notifyOnChangeProps: active ? undefined : [], staleTime: 60_000,
  });
  const scores = useMemo(() => {
    const seen = new Set<number>();
    return (query.data?.pages ?? []).flatMap(page => page.scores).filter(score => {
      if (seen.has(score.beatmapset.id)) return false;
      seen.add(score.beatmapset.id); return true;
    });
  }, [query.data]);
  return { ...query, bound, scores };
}
