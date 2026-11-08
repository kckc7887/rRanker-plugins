import { resolveGameResources, getGameResourceSource, usePluginRevision } from '@rranker/sdk/registry';
import { useQuery } from '@tanstack/react-query';
import {
  CHUNITHM_COLLECTION_LIST_SCHEMA_VERSION,
  type ChunithmCollectionKind,
  type ChunithmCollectionListSnapshot,
} from '@rranker/game-chunithm/domain/chunithm-collections';
import {
  loadChunithmCollections,
} from '@rranker/game-chunithm/services/chunithm-collection-loader';
import { useSession } from '@rranker/sdk/state/session-store';

export function useChunithmCollections(kind: ChunithmCollectionKind, enabled = true) {
  usePluginRevision();
  const resourceSource = getGameResourceSource('chunithm');
  const activeGameId = useSession((state) => state.activeGameId);
  const queryKey = ['chunithm-collections', CHUNITHM_COLLECTION_LIST_SCHEMA_VERSION, kind, resourceSource?.id];
  return useQuery({ meta: { pluginId: 'game.chunithm', gameId: 'chunithm', sourcePluginId: resourceSource?.id },
    enabled: enabled && !!resolveGameResources('chunithm') && activeGameId === 'chunithm',
    queryKey,
    queryFn: ({ signal }): Promise<ChunithmCollectionListSnapshot> => loadChunithmCollections(kind, signal),
    staleTime: 30 * 60_000,
  });
}

export type { ChunithmCollectionListSnapshot };
