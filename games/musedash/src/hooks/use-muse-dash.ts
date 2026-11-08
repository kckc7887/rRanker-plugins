import type { MuseDashDataSource, MuseDashResources } from '../data-source';

import { useSession } from '@rranker/sdk/state/session-store';
import { getDataSource, getGameResourceSource, resolveGameResources, usePluginRevision } from '@rranker/sdk/registry';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useBoundedQueries } from '@rranker/sdk/hooks/use-bounded-queries';
import type { DataSource } from '@rranker/sdk/data';import type { MuseDashAlbumsResponse, MuseDashCeResponse, MuseDashDiffdiffEntry, MuseDashMissDetailValue, MuseDashPlayDetail, MuseDashPlayer } from '@rranker/game-musedash/domain/muse-dash';
import { MUSE_DASH_MISS_DETAIL_FAILED } from '@rranker/game-musedash/domain/muse-dash';


import { queryClient } from '@rranker/sdk/state/query-client';

import { useCachedTabActive } from '@rranker/sdk/components/CachedTabScreen';



type MuseDashSnapshot<T> = { data: T; source: DataSource };
const MUSE_DASH_QUERY_OPTIONS = { staleTime: 60_000, gcTime: 10 * 60_000 } as const;
const MUSE_DASH_SESSION_RESOURCE_QUERY_OPTIONS = { staleTime: Infinity, gcTime: Infinity, refetchOnMount: false, refetchOnReconnect: false } as const;
function resources(): MuseDashResources {
 const value = resolveGameResources('musedash') as MuseDashResources | undefined;
 if (!value) throw new Error('Muse Dash 数据来源不可用');
 return value;
}
export function refreshMuseDashResources(queryClient: import('@tanstack/react-query').QueryClient) { return resources().refresh(queryClient); }

export type MuseDashQuery<T> = {
  data: T | undefined;
  source: DataSource | undefined;
  isLoading: boolean;
  isPending: boolean;
  isError: boolean;
  error: Error | null;
  isFetching: boolean;
  refetch: () => Promise<unknown>;
};

function useMuseDashSnapshot<T>(
  queryKey: readonly unknown[],
  load: (signal: AbortSignal) => Promise<MuseDashSnapshot<T>>,
  enabled = true,
  queryOptions: {
    staleTime: number;
    gcTime: number;
    refetchOnMount?: false;
    refetchOnReconnect?: false;
  } = MUSE_DASH_QUERY_OPTIONS,
  accountId?: string | null,
): MuseDashQuery<T> {
  usePluginRevision();
  const providerId = useSession(state => state.activeProviderId);
  const source = accountId ? providerId ? getDataSource(providerId) : undefined : getGameResourceSource('musedash');
  const tabActive = useCachedTabActive();
  const query = useQuery({ meta: { pluginId: 'game.musedash', gameId: 'musedash', sourcePluginId: source?.id, accountId },
    queryKey,
    queryFn: ({ signal }) => load(signal),
    enabled: enabled && tabActive && !!source,
    notifyOnChangeProps: tabActive ? undefined : [],
    ...queryOptions,
  });
  const snapshot = query.data as MuseDashSnapshot<T> | undefined;
  return {
    data: snapshot?.data,
    source: snapshot?.source,
    isLoading: query.isLoading,
    isPending: query.isPending,
    isError: query.isError,
    error: query.error as Error | null,
    isFetching: query.isFetching,
    refetch: query.refetch,
  };
}

export function useMuseDashSearch(query: string) {
  usePluginRevision();
  const resources = resolveGameResources('musedash') as MuseDashResources | undefined;
  const normalized = query.trim();
  return useQuery({ meta: { pluginId: 'game.musedash', gameId: 'musedash', sourcePluginId: getGameResourceSource('musedash')?.id },
    queryKey: ['musedash', 'players', 'search', normalized],
    queryFn: ({ signal }) => resources!.searchPlayers(normalized, signal),
    enabled: !!resources && normalized.length > 0,
    ...MUSE_DASH_QUERY_OPTIONS,
  });
}

export function useMuseDashPlayer(userId: string | null, enabled = true) {
  usePluginRevision();
  const source = getGameResourceSource('musedash');
  const tabActive = useCachedTabActive();
  const query = useQuery({
    meta: { pluginId: 'game.musedash', gameId: 'musedash', sourcePluginId: source?.id },
    queryKey: ['musedash', 'player', userId],
    queryFn: ({ signal }) => resources().loadPlayer(queryClient, userId!, signal),
    ...MUSE_DASH_QUERY_OPTIONS,
    enabled: enabled && tabActive && !!source && userId !== null,
    notifyOnChangeProps: tabActive ? undefined : [],
  });
  const snapshot = query.data as MuseDashSnapshot<MuseDashPlayer> | undefined;
  return {
    data: snapshot?.data,
    source: snapshot?.source,
    isLoading: query.isLoading,
    isPending: query.isPending,
    isError: query.isError,
    error: query.error as Error | null,
    isFetching: query.isFetching,
    refetch: query.refetch,
  };
}

export function useMuseDashPlayDetail(
  uid: string | null,
  difficulty: number | null,
  platform: string | null,
  userId: string | null,
) {
  const accountId = useSession(state => state.activeAccountId);
  usePluginRevision();
  const client = useSession(state => state.sourceClient) as MuseDashDataSource | undefined;
  const enabled = !!client && uid !== null && difficulty !== null && platform !== null && userId !== null;
  const queryKey = ['musedash', 'play-detail', userId, uid, difficulty, platform] as const;
  return useMuseDashSnapshot<MuseDashPlayDetail>(queryKey, async (signal) => {
    return client!.getPlayDetail(uid!, difficulty!, platform!, signal);
  }, enabled, MUSE_DASH_QUERY_OPTIONS, accountId);
}

const MUSE_DASH_DETAIL_CONCURRENCY = 6;

export type MuseDashPlayDetailsResult = {
  /** 键为 uid:difficulty。 */
  missByChart: ReadonlyMap<string, MuseDashMissDetailValue>;
  failedCount: number;
  retryFailed: () => void;
};

/** null 表示未完成，undefined 表示上游缺失，FAILED 表示请求失败；仅数字参与成就判定。 */
export function useMuseDashPlayDetails(
  items: readonly { uid: string; difficulty: number; platform: string }[],
  userId: string | null,
  enabled: boolean,
): MuseDashPlayDetailsResult {
  const accountId = useSession(state => state.activeAccountId);
  const providerId = useSession(state => state.activeProviderId);
  const sourcePluginId = providerId ? getDataSource(providerId)?.id : undefined;
  usePluginRevision();
  const client = useSession(state => state.sourceClient) as MuseDashDataSource | undefined;
  const queryDefs = useMemo(() => enabled && client && userId !== null ? items.map((item) => ({ meta: { pluginId: 'game.musedash', gameId: 'musedash', accountId, sourcePluginId },
    queryKey: ['musedash', 'play-detail', userId, item.uid, item.difficulty, item.platform] as const,
    queryFn: async ({ signal }: { signal: AbortSignal }): Promise<MuseDashSnapshot<MuseDashPlayDetail>> => {
      return client.getPlayDetail(item.uid, item.difficulty, item.platform, signal);
    },
    ...MUSE_DASH_QUERY_OPTIONS,
  })) : [], [items, userId, enabled, accountId, client, sourcePluginId]);
  const { queries, retryFailed } = useBoundedQueries(queryDefs, MUSE_DASH_DETAIL_CONCURRENCY, enabled, false);
  const missByChart = useMemo(() => {
    const map = new Map<string, MuseDashMissDetailValue>();
    const count = enabled ? items.length : 0;
    for (let index = 0; index < count; index += 1) {
      const item = items[index];
      const query = queries[index];
      if (!item) continue;
      if (!query) { map.set(`${item.uid}:${item.difficulty}`, null); continue; }
      const key = `${item.uid}:${item.difficulty}`;
      if (query.isError) map.set(key, MUSE_DASH_MISS_DETAIL_FAILED);
      else if (!query.isFetched || query.isLoading) map.set(key, null);
      else map.set(key, query.data?.data?.play?.miss);
    }
    return map;
  }, [enabled, items, queries]);
  const failedCount = useMemo(
    () => [...missByChart.values()].filter((value) => value === MUSE_DASH_MISS_DETAIL_FAILED).length,
    [missByChart],
  );
  return { missByChart, failedCount, retryFailed };
}

export function useMuseDashAlbums(enabled = true) {
  const queryKey = ['musedash', 'albums'] as const;
  return useMuseDashSnapshot<MuseDashAlbumsResponse>(queryKey, async (signal) => {
    return resources().loadAlbums(signal);
  }, enabled, MUSE_DASH_SESSION_RESOURCE_QUERY_OPTIONS);
}

export function useMuseDashCe(enabled = true) {
  const queryKey = ['musedash', 'ce'] as const;
  return useMuseDashSnapshot<MuseDashCeResponse>(queryKey, async (signal) => {
    return resources().loadCe(signal);
  }, enabled, MUSE_DASH_SESSION_RESOURCE_QUERY_OPTIONS);
}

export function useMuseDashDiffdiff(enabled = true) {
  const queryKey = ['musedash', 'diffdiff'] as const;
  return useMuseDashSnapshot<MuseDashDiffdiffEntry[]>(queryKey, async (signal) => {
    return resources().loadDiffdiff(signal);
  }, enabled, MUSE_DASH_SESSION_RESOURCE_QUERY_OPTIONS);
}
