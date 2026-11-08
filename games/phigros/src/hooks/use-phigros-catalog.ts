import { resolveGameResources, usePluginRevision } from '@rranker/sdk/registry';
import type { PhigrosResources } from '../data-source';
import { phigrosCatalogOptions, type PhigrosCatalogData } from '@rranker/game-phigros/services/phigros-catalog-query';
import { useMemo } from 'react';
import { staleCached } from '@rranker/sdk/services/cache-first';

import type { CatalogSnapshot } from '@rranker/game-phigros/domain/models';
import { type PhigrosKyouAliasesSnapshot } from '@rranker/game-phigros/domain/phigros-kyou';

import { useAliasedCatalog } from '@rranker/sdk/hooks/use-aliased-catalog';



import { useCachedTabActive } from '@rranker/sdk/components/CachedTabScreen';
import { queryClient } from '@rranker/sdk/state/query-client';

export function usePhigrosCatalog(enabled = true) {
  const tabActive = useCachedTabActive();
  usePluginRevision();
  const provider = resolveGameResources('phigros') as PhigrosResources | undefined;
  const query = useAliasedCatalog<CatalogSnapshot, PhigrosKyouAliasesSnapshot, PhigrosCatalogData>(
    phigrosCatalogOptions(queryClient, provider, enabled && tabActive && !!provider),
  );
  const data = useMemo(() => query.isError && query.data ? {
    ...query.data, snapshot: { ...query.data.snapshot, source: staleCached(query.data.snapshot.source) },
  } : query.data, [query.data, query.isError]);
  return { ...query, data, isError: query.isError && !data };
}
