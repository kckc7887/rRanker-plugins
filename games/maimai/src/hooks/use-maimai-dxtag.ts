import { useQuery } from '@tanstack/react-query';
import type { ChartType } from '@rranker/game-maimai/domain/models';
import {
  maimaiDxTagChartId, maimaiDxTagScoresForDifficulty, type MaimaiDxTagScores,
} from '@rranker/game-maimai/domain/maimai-dxtag';
import { useDetailedCatalog } from '@rranker/game-maimai/hooks/use-detailed-catalog';
import { useCachedTabActive } from '@rranker/sdk/components/CachedTabScreen';
import { useAppLifecycle } from '@rranker/sdk/state/app-lifecycle';
import { loadCachedMaimaiDxTag } from '@rranker/game-maimai/services/maimai-dxtag-cache';

export function useMaimaiDxTag(enabled = true) {
  const active = useCachedTabActive();
  const { foregroundReady } = useAppLifecycle();
  const catalog = useDetailedCatalog(enabled);
  return useQuery({ meta: { pluginId: 'game.maimai', gameId: 'maimai' },
    enabled: enabled && active && foregroundReady && !!catalog.data,
    notifyOnChangeProps: active ? undefined : [],
    queryKey: ['maimai-dxtag', 'all', catalog.data?.source.updatedAt],
    queryFn: ({ signal }) => loadCachedMaimaiDxTag(catalog.data!, signal),
    staleTime: query => query.state.data?.coversCatalog ? Infinity : 0,
    retry: false,
  });
}

export function useMaimaiDxTagScores(
  songId: string, chartType: ChartType, levelIndex: number,
): MaimaiDxTagScores | null {
  const chartId = maimaiDxTagChartId(songId, chartType);
  const query = useMaimaiDxTag(chartId !== null);
  const charts = chartId === null ? undefined : query.data?.library[chartId];
  return charts ? maimaiDxTagScoresForDifficulty(charts, levelIndex) : null;
}
