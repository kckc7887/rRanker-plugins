import { captureResourceWrites } from '@rranker/sdk/services/snapshot-cache-utils';
import { RIZLINE_CATALOG_QUERY_KEY, RIZLINE_CATALOG_QUERY_OPTIONS, applyRizlineCatalog } from '@rranker/game-rizline/services/rizline-catalog-query';
import { useQuery } from '@tanstack/react-query';
import { useCachedTabActive } from '@rranker/sdk/components/CachedTabScreen';
import { rizlineResources } from '@rranker/game-rizline/services/rizline-resources';


import { queryClient } from '@rranker/sdk/state/query-client';
export function useRizlineCatalog(enabled = true) {
  const active = useCachedTabActive();
  return useQuery({ queryKey: RIZLINE_CATALOG_QUERY_KEY, ...RIZLINE_CATALOG_QUERY_OPTIONS, enabled: enabled && active,
    notifyOnChangeProps: active ? undefined : [],
    queryFn: ({ signal }) => rizlineResources.load(signal, data => applyRizlineCatalog(queryClient, data, captureResourceWrites('rizline', signal))) });
}
