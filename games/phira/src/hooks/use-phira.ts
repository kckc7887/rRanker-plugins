import { resolveGameResources, getGameResourceSource, usePluginRevision } from '@rranker/sdk/registry';
import { resolveAccountClient } from '@rranker/sdk/state/session-provider-resolver';
import type { PhiraResources, PhiraDataSource , PhiraBestRefreshResult, PhiraBestRefreshStatus, PhiraBestRefreshTarget } from '../data-source';
import { useSession } from '@rranker/sdk/state/session-store';
import { captureResourceWrites } from '@rranker/sdk/services/snapshot-cache-utils';
import { useEffect, useMemo, useRef } from 'react';
import { getForegroundAbortSignal } from '@rranker/sdk/state/app-lifecycle';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import type { PhiraChart, PhiraChartPage, PhiraChartStatus } from '@rranker/game-phira/domain/phira';

import { dedupePhiraCharts, phiraCatalogNextPage } from '@rranker/game-phira/domain/phira-filters';
import { publishEntityValue } from '@rranker/sdk/services/game-data-query';
import { queryClient } from '@rranker/sdk/state/query-client';
import { useCachedTabActive } from '@rranker/sdk/components/CachedTabScreen';

const PHIRA_QUERY_OPTIONS = { staleTime: 60_000, gcTime: 10 * 60_000 } as const;
const phiraBestsEntityKey = (id: number) => ['phira', 'bests', id] as const;
function resources(): PhiraResources {
  const value = resolveGameResources('phira') as PhiraResources | undefined;
  if (!value) throw new Error('Phira 数据来源不可用');
  return value;
}

export function usePhiraPlayerSearch(value: string) {
  usePluginRevision();
  const query = value.trim();
  const numericId = /^\d+$/.test(query) ? Number(query) : null;
  return useQuery({ meta: { pluginId: 'game.phira', gameId: 'phira', sourcePluginId: getGameResourceSource('phira')?.id },
    queryKey: ['phira', 'players', query], enabled: query.length > 0,
    queryFn: async ({ signal }) => numericId ? [await resources().getUser(numericId, signal)] : resources().searchUsers(query, signal),
    ...PHIRA_QUERY_OPTIONS,
  });
}

export function usePhiraPlayer(playerId: number | null, enabled = true) {
  usePluginRevision();
  const tabActive = useCachedTabActive();
  const fallbackId = playerId ?? 0;
  return useQuery({
    meta: { pluginId: 'game.phira', gameId: 'phira', sourcePluginId: getGameResourceSource('phira')?.id },
    queryKey: ['phira', 'player', fallbackId],
    queryFn: ({ signal }) => resources().loadPlayer(queryClient, fallbackId, signal),
    ...PHIRA_QUERY_OPTIONS,
    enabled: enabled && tabActive && playerId !== null,
    notifyOnChangeProps: tabActive ? undefined : [],
  });
}

export function usePhiraBests(playerId: number | null, enabled = true) {
  usePluginRevision();
  const accountId = useSession(state => state.activeAccountId);
  const tabActive = useCachedTabActive();
  return useQuery({ meta: { pluginId: 'game.phira', gameId: 'phira', sourcePluginId: getGameResourceSource('phira')?.id, accountId },
    queryKey: phiraBestsEntityKey(playerId ?? 0), enabled: enabled && tabActive && playerId !== null,
    notifyOnChangeProps: tabActive ? undefined : [],
    queryFn: () => resources().readBests(playerId!), ...PHIRA_QUERY_OPTIONS,
  });
}

export type PhiraBestRefreshOutcome = {
  status: PhiraBestRefreshStatus | 'cancelled';
  requestedCount: number;
  updatedCount: number;
  failedChartIds: number[];
};

const refreshOutcome = (status: PhiraBestRefreshOutcome['status']): PhiraBestRefreshOutcome =>
  ({ status, requestedCount: 0, updatedCount: 0, failedChartIds: [] });

const outcomeFrom = (result: PhiraBestRefreshResult): PhiraBestRefreshOutcome => ({
  status: result.refresh.status,
  requestedCount: result.refresh.requestedChartIds.length,
  updatedCount: result.refresh.updatedChartIds.length,
  failedChartIds: result.refresh.failures.map((failure) => failure.chartId),
});

export function useRefreshAllPhiraBests(playerId: number | null) {
  usePluginRevision();
  const lifetime = useRef(new AbortController());
  const failedTargets = useRef<readonly PhiraBestRefreshTarget[]>([]);
  useEffect(() => {
    const controller = new AbortController();
    lifetime.current = controller;
    failedTargets.current = [];
    return () => controller.abort();
  }, [playerId]);
  const runRefresh = async (
    run: (signal: AbortSignal, assertCurrent: () => void) => Promise<PhiraBestRefreshResult>,
  ): Promise<PhiraBestRefreshOutcome> => {
    if (playerId === null) return refreshOutcome('noop');
    const controller = new AbortController();
    const foreground = getForegroundAbortSignal();
    const cancel = () => controller.abort();
    const signals = [foreground, lifetime.current.signal];
    signals.forEach((signal) => signal.addEventListener('abort', cancel, { once: true }));
    if (signals.some((signal) => signal.aborted)) cancel();
    const assertCurrent = captureResourceWrites('phira', controller.signal, `phira:community:${playerId}`);
    try {
      assertCurrent();
      const result = await run(controller.signal, assertCurrent);
      assertCurrent();
      if (result.snapshot) await publishEntityValue(queryClient, phiraBestsEntityKey(playerId), result.snapshot, assertCurrent);
      assertCurrent();
      failedTargets.current = result.refresh.failures.map((failure) => failure.target);
      return outcomeFrom(result);
    } catch (error) {
      if (controller.signal.aborted) return refreshOutcome('cancelled');
      throw error;
    } finally {
      signals.forEach((signal) => signal.removeEventListener('abort', cancel));
    }
  };
  const refreshAll = () => runRefresh(async (signal, assertCurrent) => {
    await resources().refreshPlayer(playerId!, signal);
    assertCurrent();
    return resources().refreshAllBests(playerId!, signal);
  });
  const retryFailed = () => {
    const targets = failedTargets.current;
    if (playerId === null || targets.length === 0) return Promise.resolve(refreshOutcome('noop'));
    return runRefresh((signal) => resources().refreshBestTargets(playerId, targets, signal));
  };
  return { refreshAll, retryFailed };
}

export function usePhiraCharts(status: PhiraChartStatus, search: string, enabled = true, accountId?: string) {
  usePluginRevision();
  const tabActive = useCachedTabActive();
  const normalized = search.trim();
  return useInfiniteQuery({ meta: { pluginId: 'game.phira', gameId: 'phira', sourcePluginId: getGameResourceSource('phira')?.id, accountId },
    queryKey: accountId === undefined ? ['phira', 'charts', status, normalized] : ['phira', 'example-scores', accountId, status, normalized], initialPageParam: 0,
    queryFn: async ({ pageParam, signal }): Promise<PhiraChartPage> => {
      const assertCurrent = captureResourceWrites('phira', signal, accountId);
      const page = await resources().getCharts({ status, page: pageParam, search: normalized || undefined }, signal);
      assertCurrent();
      return page;
    },
    /** Phira 的 page=1 与首页相同，翻页顺序为 0、2、3… */
    getNextPageParam: (last, pages) => phiraCatalogNextPage(pages, last),
    enabled: enabled && tabActive,
    notifyOnChangeProps: tabActive ? undefined : [],
    ...PHIRA_QUERY_OPTIONS,
  });
}

export function usePhiraDemoBests(accountId: string, enabled = true) {
  usePluginRevision();
  const client = resolveAccountClient(accountId) as PhiraDataSource | undefined;
  const query = usePhiraCharts('ranked', '', enabled && !!client?.createDemoBest, accountId);
  const items = useMemo(() => dedupePhiraCharts(
    query.data?.pages.flatMap((page) => page.results) ?? [],
  ).flatMap(chart => client?.createDemoBest ? [client.createDemoBest(chart)] : []), [client, query.data?.pages]);
  return { ...query, items };
}

export function usePhiraChartsByIds(ids: readonly number[]) {
  usePluginRevision();
  const sorted = useMemo(() => [...new Set(ids)].sort((a, b) => a - b), [ids]);
  return useQuery({ meta: { pluginId: 'game.phira', gameId: 'phira', sourcePluginId: getGameResourceSource('phira')?.id },
    queryKey: ['phira', 'charts-by-ids', sorted], enabled: sorted.length > 0,
    queryFn: ({ signal }) => resources().getChartsByIds(sorted, signal),
    ...PHIRA_QUERY_OPTIONS,
  });
}

export function usePhiraChart(chartId: number | null) {
  usePluginRevision();
  const active = useCachedTabActive();
  return useQuery({ meta: { pluginId: 'game.phira', gameId: 'phira', sourcePluginId: getGameResourceSource('phira')?.id },
    queryKey: ['phira', 'chart', chartId], enabled: active && chartId !== null,
    notifyOnChangeProps: active ? undefined : [],
    queryFn: ({ signal }): Promise<PhiraChart> => resources().getChart(chartId!, signal), ...PHIRA_QUERY_OPTIONS,
  });
}

export function usePhiraChartBest(playerId: number | null, chart: PhiraChart | undefined) {
  usePluginRevision();
  const accountId = useSession(state => state.activeAccountId);
  const active = useCachedTabActive();
  const bests = usePhiraBests(playerId, !!chart);
  const query = useQuery({ meta: { pluginId: 'game.phira', gameId: 'phira', sourcePluginId: getGameResourceSource('phira')?.id, accountId },
    queryKey: ['phira', 'best', playerId, chart?.id], enabled: active && playerId !== null && !!chart,
    notifyOnChangeProps: active ? undefined : [],
    queryFn: async ({ signal }) => {
      const assertCurrent = captureResourceWrites('phira', signal, `phira:community:${playerId}`);
      const cached = await resources().readBests(playerId!);
      assertCurrent();
      const existing = cached?.items[String(chart!.id)];
      if (existing) return existing;
      const player = await resources().readPlayer(playerId!);
      assertCurrent();
      const pool = [...(player?.pool.bestPool ?? []), ...(player?.pool.recentPool ?? [])]
        .find((item) => item.chart.id === chart!.id);
      const result = await resources().queryChartBest(playerId!, chart!, pool?.rks ?? null, signal);
      await publishEntityValue(queryClient, phiraBestsEntityKey(playerId!), result.snapshot, assertCurrent);
      assertCurrent();
      return result.best;
    }, ...PHIRA_QUERY_OPTIONS,
  });
  return { ...query, data: bests.data?.items[String(chart?.id)] ?? query.data };
}

export function usePhiraUploader(userId: number | null) {
  usePluginRevision();
  const active = useCachedTabActive();
  return useQuery({ meta: { pluginId: 'game.phira', gameId: 'phira', sourcePluginId: getGameResourceSource('phira')?.id }, queryKey: ['phira', 'uploader', userId], enabled: active && userId !== null,
    notifyOnChangeProps: active ? undefined : [],
    queryFn: ({ signal }) => resources().getUploader(userId!, signal), ...PHIRA_QUERY_OPTIONS });
}

export function usePhiraNotes(chart: PhiraChart | undefined, enabled = true) {
  usePluginRevision();
  const active = useCachedTabActive();
  return useQuery({ meta: { pluginId: 'game.phira', gameId: 'phira', sourcePluginId: getGameResourceSource('phira')?.id },
    queryKey: ['phira', 'notes', chart?.id, chart?.chartUpdated], enabled: active && enabled && !!chart?.file,
    notifyOnChangeProps: active ? undefined : [],
    queryFn: async ({ signal }) => {
      return resources().readNotes(chart!, signal);
    }, ...PHIRA_QUERY_OPTIONS,
  });
}
