import { chunithmCatalogOptions } from '@rranker/game-chunithm/services/chunithm-catalog-query';
import { type ChunithmAliasSnapshot, type ChunithmCatalogSnapshot } from '@rranker/game-chunithm/domain/chunithm';

import { useAliasedCatalog } from '@rranker/sdk/hooks/use-aliased-catalog';

import { useSession } from '@rranker/sdk/state/session-store';
import { queryClient } from '@rranker/sdk/state/query-client';


import { useCachedTabActive } from '@rranker/sdk/components/CachedTabScreen';

export function useChunithmCatalog(enabled = true) {
  const tabActive = useCachedTabActive();
  const activeGameId = useSession((state) => state.activeGameId);
  return useAliasedCatalog<ChunithmCatalogSnapshot, ChunithmAliasSnapshot>(
    chunithmCatalogOptions(queryClient, enabled && tabActive && activeGameId === 'chunithm'),
  );
}
