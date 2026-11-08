import { useQuery } from '@tanstack/react-query';
import { useSession } from '@rranker/sdk/state/session-store';
import { useCachedTabActive } from '@rranker/sdk/components/CachedTabScreen';
import { requireDetailedCatalogProvider, type DetailedCatalogProvider } from '@rranker/game-maimai/data-source';
import { getGameResourceSource, resolveGameResources, usePluginRevision } from '@rranker/sdk/registry';

export function usePlates(enabled = true) {
  usePluginRevision();
  const tabActive = useCachedTabActive();
  const activeGameId = useSession((state) => state.activeGameId);
  const provider = resolveGameResources('maimai') as DetailedCatalogProvider | undefined;
  const sourcePluginId = getGameResourceSource('maimai')?.id;
  const queryKey = ['plates', 'maimai', sourcePluginId];
  return useQuery({ meta: { pluginId: 'game.maimai', gameId: 'maimai', sourcePluginId },
    enabled: enabled && tabActive && activeGameId === 'maimai' && !!provider,
    notifyOnChangeProps: tabActive ? undefined : [],
    queryKey,
    queryFn: ({ signal }) => requireDetailedCatalogProvider(provider ?? null).getPlates(signal),
  });
}
