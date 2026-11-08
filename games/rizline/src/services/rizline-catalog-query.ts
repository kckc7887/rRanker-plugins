import type { QueryClient } from '@tanstack/react-query';
import { publishEntityValue } from '@rranker/sdk/services/game-data-query';
import { captureResourceWrites } from '@rranker/sdk/services/snapshot-cache-utils';
import { rizlineResources } from '@rranker/game-rizline/services/rizline-resources';
import type { RizlineCatalogData } from '@rranker/game-rizline/domain/rizline';
import { rizlinePayloadFromSnapshot } from '@rranker/game-rizline/domain/game-data';
import { type GameDataBundle } from '@rranker/sdk/data';
import { resolveAccountClient } from '@rranker/sdk/state/session-provider-resolver';
import type { RizlineDataSource } from '../data-source';


export const RIZLINE_CATALOG_QUERY_KEY = ['rizline', 'catalog'] as const;

export const RIZLINE_CATALOG_QUERY_OPTIONS = { meta: { pluginId: 'game.rizline', gameId: 'rizline' }, staleTime: Infinity, gcTime: Infinity, retry: false, refetchOnMount: false, refetchOnReconnect: false } as const;

export function applyRizlineCatalog(queryClient: QueryClient, data: RizlineCatalogData, assertCurrent?: () => void): Promise<void> {
  return publishEntityValue(queryClient, RIZLINE_CATALOG_QUERY_KEY, data, assertCurrent).then(() => {
  try { assertCurrent?.(); } catch { return; }
  for (const query of queryClient.getQueryCache().findAll({ predicate: query => query.meta?.gameId === 'rizline' && query.queryKey[0] === 'game-data' })) {
    const old = query.state.data as GameDataBundle | undefined;
    if (old?.payload.kind !== 'rizline') continue;
    const accountId = query.meta?.accountId;
    const source = typeof accountId === 'string' ? resolveAccountClient(accountId) as RizlineDataSource | undefined : undefined;
    const snapshot = source?.applyCatalog?.(data.snapshot, old.payload.snapshot) ?? old.payload.snapshot;
    queryClient.setQueryData(query.queryKey, { ...old, payload: rizlinePayloadFromSnapshot(snapshot, data) });
  }
  });
}

export function ensureRizlineCatalog(queryClient: QueryClient): Promise<RizlineCatalogData> {
  return queryClient.fetchQuery({ queryKey: RIZLINE_CATALOG_QUERY_KEY, ...RIZLINE_CATALOG_QUERY_OPTIONS, queryFn: ({ signal }) => rizlineResources.load(signal, data => applyRizlineCatalog(queryClient, data, captureResourceWrites('rizline', signal))) });
}

export async function refreshRizlineCatalog(queryClient: QueryClient, signal?: AbortSignal): Promise<RizlineCatalogData> {
  if (signal?.aborted) throw signal.reason ?? new Error('资源请求已取消');
  const cancel = () => { void queryClient.cancelQueries({ queryKey: RIZLINE_CATALOG_QUERY_KEY, exact: true }); };
  signal?.addEventListener('abort', cancel, { once: true });
  try {
    await queryClient.cancelQueries({ queryKey: RIZLINE_CATALOG_QUERY_KEY });
    if (signal?.aborted) throw signal.reason ?? new Error('资源请求已取消');
    await queryClient.invalidateQueries({ queryKey: RIZLINE_CATALOG_QUERY_KEY, refetchType: 'none' });
    if (signal?.aborted) throw signal.reason ?? new Error('资源请求已取消');
    const result = await queryClient.fetchQuery({ queryKey: RIZLINE_CATALOG_QUERY_KEY, ...RIZLINE_CATALOG_QUERY_OPTIONS, queryFn: async ({ signal }) => {
      const data = await rizlineResources.loadFresh(signal);
      if (!signal.aborted) void applyRizlineCatalog(queryClient, data, captureResourceWrites('rizline', signal));
      return data;
    } });
    if (signal?.aborted) throw signal.reason ?? new Error('资源请求已取消');
    return result;
  } finally { signal?.removeEventListener('abort', cancel); }
}
