import type { PhiraResources , PhiraDataSource } from '@rranker/game-phira/data-source';
import { phiraProvider } from './providers/phira-provider';
import { phiraSource , phiraCache } from './services/phira-cache';
import { phiraPlayerQueryOptions , phiraBestsEntityKey, phiraPlayerEntityKey } from './services/phira-query';
import { refreshAllPhiraBests, refreshPhiraBestTargets, queryPhiraChartBest , loadPhiraPlayerFresh, refreshPhiraSeedBests } from './services/phira-service';
import { countPhiraChartZip } from './services/phira-chart-notes';
import { CHART_PREVIEW_MAX_DOWNLOAD_BYTES } from '@rranker/sdk/features/chart-preview-shared/chart-preview-resource-budget';
import type { SourceClientContext } from '@rranker/sdk/credentials';

import { phiraPlayerIdFromAccountId } from '@rranker/game-phira/accounts';



export function createClient({ account }: SourceClientContext): PhiraDataSource | undefined {
  const id = phiraPlayerIdFromAccountId(account.id);
  if (id === null) return undefined;
  return { playerKey: phiraPlayerEntityKey(id), bestsKey: phiraBestsEntityKey(id), readCached: () => phiraCache.loadPlayer(id),
    readFresh: signal => loadPhiraPlayerFresh(id, signal), readBests: () => phiraCache.loadBests(id),
    refreshBests: async (snapshot, signal) => (await refreshPhiraSeedBests(snapshot, signal)).snapshot ?? null };
}

export function createResources(): PhiraResources {
 return {
  getUser: (id, signal) => phiraProvider.getUser(id, signal), searchUsers: (query, signal) => phiraProvider.searchUsers(query, signal),
  getCharts: (input, signal) => phiraProvider.getCharts(input, signal), getChart: (id, signal) => phiraProvider.getChart(id, signal),
  getChartsByIds: (ids, signal) => phiraProvider.getChartsByIds(ids, signal), getUploader: (id, signal) => phiraProvider.getUploader(id, signal),
  loadPlayer: (queryClient, id, signal) => phiraPlayerQueryOptions(queryClient, id).queryFn({ signal }),
  readPlayer: id => phiraCache.loadPlayer(id), readBests: id => phiraCache.loadBests(id),
  refreshPlayer: loadPhiraPlayerFresh, refreshAllBests: refreshAllPhiraBests, refreshBestTargets: refreshPhiraBestTargets,
  queryChartBest: queryPhiraChartBest,
  readNotes: async (chart, signal) => {
      try {
        const data = await phiraProvider.downloadChart(chart.file!, signal, CHART_PREVIEW_MAX_DOWNLOAD_BYTES);
        const value: import('@rranker/game-phira/domain/phira').PhiraNoteSnapshot = { chartUpdated: chart.chartUpdated ?? null, counts: await countPhiraChartZip(data, signal), source: phiraSource() };
        if (signal.aborted) {
          const aborted = new Error('Phira 谱面读取已取消'); aborted.name = 'AbortError'; throw aborted;
        }
        return value;
      } catch (error) {
        if (signal.aborted) throw error;
        const value: import('@rranker/game-phira/domain/phira').PhiraNoteSnapshot = { chartUpdated: chart.chartUpdated ?? null, counts: null,
          unavailableReason: '请稍后重试', source: phiraSource() };
        return value;
      }
  },
 };
}
