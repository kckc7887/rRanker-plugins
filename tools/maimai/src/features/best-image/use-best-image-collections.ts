import { useQuery } from '@tanstack/react-query';
import { requireDetailedCatalogProvider, type DetailedCatalogProvider } from '@rranker/game-maimai/data-source';
import { getGameResourceSource, resolveGameResources, usePluginRevision } from '@rranker/sdk/registry';

export function useBestImageCollections() {
  usePluginRevision();
  const provider = resolveGameResources('maimai') as DetailedCatalogProvider | undefined;
  const sourcePluginId = getGameResourceSource('maimai')?.id;
  return useQuery({
    queryKey: ['best-image-collections', 'maimai', sourcePluginId],
    meta: { pluginId: 'tool.maimai', gameId: 'maimai', sourcePluginId },
    enabled: !!provider,
    queryFn: ({ signal }) => requireDetailedCatalogProvider(provider ?? null).getCollections({
      kinds: ['icon', 'plate', 'trophy', 'frame'],
      required: false,
    }, signal),
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: 7 * 24 * 60 * 60 * 1000,
    retry: 2,
  });
}
