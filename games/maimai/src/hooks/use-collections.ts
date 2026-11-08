import { useQuery } from '@tanstack/react-query';
import { useSession } from '@rranker/sdk/state/session-store';
import { requireDetailedCatalogProvider, type DetailedCatalogProvider } from '@rranker/game-maimai/data-source';
import { getGameResourceSource, resolveGameResources, usePluginRevision } from '@rranker/sdk/registry';
import { useCachedTabActive } from '@rranker/sdk/components/CachedTabScreen';

export function useCollections() {
  usePluginRevision();
  const active = useCachedTabActive();
  const activeGameId = useSession((state) => state.activeGameId);
  const provider = resolveGameResources('maimai') as DetailedCatalogProvider | undefined;
  const sourcePluginId = getGameResourceSource('maimai')?.id;
  const queryKey = ['collections', 'maimai', sourcePluginId];
  return useQuery({ meta: { pluginId: 'game.maimai', gameId: 'maimai', sourcePluginId },
    enabled: active && activeGameId === 'maimai' && !!provider,
    notifyOnChangeProps: active ? undefined : [],
    queryKey,
    queryFn: ({ signal }) => requireDetailedCatalogProvider(provider ?? null).getCollections(undefined, signal),
  });
}
