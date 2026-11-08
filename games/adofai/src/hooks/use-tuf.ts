import { resolveGameResources, getGameResourceSource, usePluginRevision } from '@rranker/sdk/registry';
import { resolveAccountClient } from '@rranker/sdk/state/session-provider-resolver';
import type { TufResources, AdofaiDataSource } from '../data-source';
import { useSession } from '@rranker/sdk/state/session-store';
import { captureResourceWrites } from '@rranker/sdk/services/snapshot-cache-utils';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useBoundedQueries } from '@rranker/sdk/hooks/use-bounded-queries';
import type { InfiniteData } from '@tanstack/react-query';
import { TUF_PAGE_SIZE, selectBestTufLevelPass, tufHttpsUrl, uniqueTufPassesByLevel, type TufLevelDetailResponse, type TufLevelPass, type TufLevelPage, type TufLevelQuery, type TufPassPage, type TufPassQuery, type TufPlayerSnapshot } from '@rranker/game-adofai/domain/tuf';


import { queryClient } from '@rranker/sdk/state/query-client';
import { invalidateTufDifficulties } from '../services/game-data';
import { useCachedTabActive } from '@rranker/sdk/components/CachedTabScreen';




const TUF_QUERY_OPTIONS = { staleTime: 60_000, gcTime: 10 * 60_000 } as const;
const TUF_SESSION_RESOURCE_QUERY_OPTIONS = { staleTime: Infinity, gcTime: Infinity, refetchOnMount: false, refetchOnReconnect: false } as const;
function resources(): TufResources {
  const value = resolveGameResources('adofai') as TufResources | undefined;
  if (!value) throw new Error('ADOFAI 数据来源不可用');
  return value;
}

export function useTufProfile(playerId: number | null, enabled = true) {
  usePluginRevision();
  const tabActive = useCachedTabActive();
  return useQuery({
    meta: { pluginId: 'game.adofai', gameId: 'adofai', sourcePluginId: getGameResourceSource('adofai')?.id },
    queryKey: ['tuf', 'player', playerId, 'profile'],
    queryFn: ({ signal }) => resources().loadPlayer(queryClient, playerId!, signal),
    ...TUF_QUERY_OPTIONS,
    select: (snapshot: TufPlayerSnapshot) => snapshot.data,
    enabled: enabled && tabActive && playerId !== null,
    notifyOnChangeProps: tabActive ? undefined : [],
  });
}

export function useTufPlayerSearch(query: string) {
  usePluginRevision();
  const normalized = query.trim();
  return useQuery({ meta: { pluginId: 'game.adofai', gameId: 'adofai', sourcePluginId: getGameResourceSource('adofai')?.id },
    queryKey: ['tuf', 'players', 'search', normalized],
    queryFn: ({ signal }) => resources().searchPlayers(normalized, TUF_PAGE_SIZE, 0, signal),
    enabled: normalized.length > 0,
    ...TUF_QUERY_OPTIONS,
  });
}

function tufPassesQueryKey(playerId: number, options: Omit<TufPassQuery, 'offset' | 'limit'>) {
  return ['tuf', 'player', playerId, 'passes', options] as const;
}

function mergeTufPassPage(
  playerId: number,
  options: Omit<TufPassQuery, 'offset' | 'limit'>,
  page: TufPassPage,
): void {
  const queryKey = tufPassesQueryKey(playerId, options);
  queryClient.setQueryData<InfiniteData<TufPassPage>>(queryKey, (old) => {
    if (!old) return undefined;
    const entries = old.pages.map((item, index) => ({ page: item, pageParam: old.pageParams[index] ?? item.offset }));
    const existing = entries.findIndex((entry) => entry.page.offset === page.offset);
    if (existing >= 0) entries[existing] = { page, pageParam: page.offset };
    else entries.push({ page, pageParam: page.offset });
    entries.sort((left, right) => left.page.offset - right.page.offset);
    return { pages: entries.map((entry) => entry.page), pageParams: entries.map((entry) => entry.pageParam) };
  });
}

async function loadTufPassPage(
  playerId: number,
  options: Omit<TufPassQuery, 'offset' | 'limit'>,
  offset: number,
  signal?: AbortSignal,
): Promise<TufPassPage> {
  return resources().getPasses(playerId, {
    ...options, offset, limit: TUF_PAGE_SIZE,
  }, signal);
}

export async function prefetchTufPassPage(
  playerId: number,
  options: Omit<TufPassQuery, 'offset' | 'limit'>,
  offset: number,
  signal?: AbortSignal,
): Promise<TufPassPage> {
  const assertCurrent = captureResourceWrites('adofai', signal, `adofai:tuf:${playerId}`);
  const page = await loadTufPassPage(playerId, options, offset, signal);
  assertCurrent();
  if (!signal?.aborted) mergeTufPassPage(playerId, options, page);
  return page;
}

export function useTufPasses(playerId: number | null, options: Omit<TufPassQuery, 'offset' | 'limit'>, enabled = true) {
  usePluginRevision();
  const accountId = useSession(state => state.activeAccountId);
  const tabActive = useCachedTabActive();
  return useInfiniteQuery({ meta: { pluginId: 'game.adofai', gameId: 'adofai', sourcePluginId: getGameResourceSource('adofai')?.id, accountId },
    queryKey: ['tuf', 'player', playerId, 'passes', options] as const,
    queryFn: ({ pageParam, signal }): Promise<TufPassPage> => loadTufPassPage(playerId!, options, pageParam, signal),
    initialPageParam: 0,
    getNextPageParam: (last) => last.offset + last.passes.length < last.total
      ? last.offset + last.limit
      : undefined,
    enabled: enabled && tabActive && playerId !== null,
    notifyOnChangeProps: tabActive ? undefined : [],
    ...TUF_QUERY_OPTIONS,
  });
}

export function useTufLevelSearch(
  query: string,
  options: Omit<TufLevelQuery, 'query' | 'offset' | 'limit'> = {},
  enabled = true,
  accountId?: string,
) {
  usePluginRevision();
  const tabActive = useCachedTabActive();
  const normalized = query.trim();
  const queryKey = accountId === undefined ? ['tuf', 'levels', normalized, options] as const
    : ['tuf', 'example-scores', accountId, normalized, options] as const;
  return useInfiniteQuery({ meta: { pluginId: 'game.adofai', gameId: 'adofai', sourcePluginId: getGameResourceSource('adofai')?.id, accountId },
    queryKey,
    queryFn: async ({ pageParam, signal }): Promise<TufLevelPage> => {
      const assertCurrent = captureResourceWrites('adofai', signal, accountId);
      const page = await resources().searchLevels({
        ...options, query: normalized || undefined, offset: pageParam, limit: TUF_PAGE_SIZE,
      }, signal);
      assertCurrent();
      return page;
    },
    initialPageParam: 0,
    getNextPageParam: (last) => last.hasMore ? last.offset + last.limit : undefined,
    enabled: enabled && tabActive,
    notifyOnChangeProps: tabActive ? undefined : [],
    ...TUF_QUERY_OPTIONS,
  });
}

export function useTufDemoPasses(accountId: string, enabled = true) {
  usePluginRevision();
  const client = resolveAccountClient(accountId) as AdofaiDataSource | undefined;
  const query = useTufLevelSearch('', { sort: 'DIFF', order: 'DESC', pguRange: 'P1,U20' }, enabled && !!client?.createDemoPass, accountId);
  const items = useMemo(() => uniqueTufPassesByLevel(
    query.data?.pages.flatMap((page) => page.results.flatMap((level) => {
      if (level.difficulty?.type !== 'PGU') return [];
      const pass = client?.createDemoPass?.(level);
      return pass ? [pass] : [];
    })) ?? [],
  ), [client, query.data?.pages]);
  return { ...query, items };
}

export async function refreshTufDifficulties(): Promise<void> {
  await invalidateTufDifficulties(queryClient);
}

export function useTufDifficulties(enabled = true) {
  usePluginRevision();
  const tabActive = useCachedTabActive();
  const queryKey = ['tuf', 'difficulties'] as const;
  return useQuery({ meta: { pluginId: 'game.adofai', gameId: 'adofai', sourcePluginId: getGameResourceSource('adofai')?.id },
    queryKey,
    queryFn: ({ signal }) => resources().getDifficulties(signal),
    enabled: enabled && tabActive,
    notifyOnChangeProps: tabActive ? undefined : [],
    ...TUF_SESSION_RESOURCE_QUERY_OPTIONS,
  });
}

export function useTufVideoDetails(videoLink: string | null | undefined, enabled = true) {
  usePluginRevision();
  const active = useCachedTabActive();
  return useQuery({ ...tufVideoDetailsQueryOptions(videoLink, enabled && active),
    notifyOnChangeProps: active ? undefined : [],
  });
}

export function tufVideoDetailsQueryOptions(videoLink: string | null | undefined, enabled = true) {
  const normalized = tufHttpsUrl(videoLink);
  return { meta: { pluginId: 'game.adofai', gameId: 'adofai', sourcePluginId: getGameResourceSource('adofai')?.id },
    queryKey: ['tuf', 'media', 'video-details', normalized],
    queryFn: ({ signal }: { signal: AbortSignal }) => resources().getVideoDetails(normalized!, signal),
    enabled: enabled && normalized !== null,
    ...TUF_QUERY_OPTIONS,
  } as const;
}

export function useTufLevelBestPass(levelId: number | null, playerId: number | null) {
  usePluginRevision();
  const active = useCachedTabActive();
  const query = useQuery({ meta: { pluginId: 'game.adofai', gameId: 'adofai', sourcePluginId: getGameResourceSource('adofai')?.id },
    queryKey: ['tuf', 'level', levelId, 'passes'],
    queryFn: ({ signal }): Promise<TufLevelPass[]> => resources().getLevelPasses(levelId!, signal),
    notifyOnChangeProps: active ? undefined : [],
    enabled: active && levelId !== null && playerId !== null,
    ...TUF_QUERY_OPTIONS,
  });
  return { ...query, data: selectBestTufLevelPass(query.data ?? [], playerId) };
}

function tufLevelQueryOptions(levelId: number | null) {
  return { meta: { pluginId: 'game.adofai', gameId: 'adofai', sourcePluginId: getGameResourceSource('adofai')?.id },
    queryKey: ['tuf', 'level', levelId] as const,
    queryFn: ({ signal }: { signal: AbortSignal }): Promise<TufLevelDetailResponse> => resources().getLevel(levelId!, signal),
    ...TUF_QUERY_OPTIONS,
  };
}

export function useTufLevel(levelId: number | null) {
  usePluginRevision();
  const active = useCachedTabActive();
  return useQuery({
    ...tufLevelQueryOptions(levelId),
    notifyOnChangeProps: active ? undefined : [],
    enabled: active && levelId !== null,
  });
}

export function useTufLibraryLevels(levelIds: readonly number[]) {
  usePluginRevision();
  const definitions = useMemo(() => [...new Set(levelIds)].map(tufLevelQueryOptions), [levelIds]);
  return useBoundedQueries(definitions, 3).queries;
}
