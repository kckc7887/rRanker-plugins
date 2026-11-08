import { useQuery } from '@tanstack/react-query';
import {
  PHIGROS_KYOU_TAGS_RESOURCE_KEY,
} from '@rranker/game-phigros/domain/phigros-kyou';
import type { PhigrosResources } from '../data-source';
import { resolveGameResources, getGameResourceSource, usePluginRevision } from '@rranker/sdk/registry';
import { useSession } from '@rranker/sdk/state/session-store';
import { useCachedTabActive } from '@rranker/sdk/components/CachedTabScreen';
const PHIGROS_KYOU_STALE_TIME_MS = 60 * 60 * 1000;





export function usePhigrosKyouChartTags(enabled = true) {
  usePluginRevision();
  const provider = resolveGameResources('phigros') as PhigrosResources | undefined;
  const tabActive = useCachedTabActive();
  const activeGameId = useSession((state) => state.activeGameId);
  return useQuery({ meta: { pluginId: 'game.phigros', gameId: 'phigros', sourcePluginId: getGameResourceSource('phigros')?.id },
    enabled: !!provider?.getChartTags && enabled && tabActive && activeGameId === 'phigros',
    notifyOnChangeProps: tabActive ? undefined : [],
    queryKey: [PHIGROS_KYOU_TAGS_RESOURCE_KEY],
    queryFn: ({ signal }) => provider!.getChartTags!(signal),
    staleTime: PHIGROS_KYOU_STALE_TIME_MS,
  });
}
