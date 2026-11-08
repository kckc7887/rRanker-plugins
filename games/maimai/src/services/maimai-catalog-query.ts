import { getGameResourceSource } from '@rranker/sdk/registry';
import type { QueryClient } from '@tanstack/react-query';
import type { AliasSnapshot, CatalogSnapshot } from '@rranker/game-maimai/domain/models';
import { requireDetailedCatalogProvider, type DetailedCatalogProvider } from '@rranker/game-maimai/data-source';
import { aliasedCatalogSource, loadAliasedCatalog, type AliasedCatalogOptions } from '@rranker/sdk/services/aliased-catalog-query';
import { aliasesForCatalogSong } from '@rranker/game-maimai/domain/catalog';
import { publishEntityValue } from '@rranker/sdk/services/game-data-query';


export const MAIMAI_CATALOG_QUERY_KEY = ['detailed-catalog', 'maimai', 2] as const;


export function maimaiCatalogOptions(
  queryClient: QueryClient,
  provider: DetailedCatalogProvider | null,
  enabled?: boolean,
): AliasedCatalogOptions<CatalogSnapshot, AliasSnapshot, CatalogSnapshot> {
  return {
    meta: { pluginId: 'game.maimai', sourcePluginId: getGameResourceSource('maimai')?.id, gameId: 'maimai' },
    enabled: enabled !== false && provider !== null,
    queryKey: MAIMAI_CATALOG_QUERY_KEY,
    loadCached: async () => null,
    loadCatalog: (signal) => requireDetailedCatalogProvider(provider).getCatalog(signal),
    loadAliases: (signal) => requireDetailedCatalogProvider(provider).getAliases(signal),
    mergeAliases: (catalog, aliasSnapshot) => {
      const aliases = new Map(aliasSnapshot?.aliases.map((item) => [item.songId, item.aliases]) ?? []);
      return {
        ...catalog,
        songs: catalog.songs.map((song) => ({
          ...song,
          aliases: aliasesForCatalogSong(song.id, aliases),
        })),
      };
    },
    composeSource: (catalog, aliasSnapshot) => aliasedCatalogSource(catalog, aliasSnapshot, {
      stale: '（含缓存资源）',
      aliasMissing: '（别名暂不可用）',
    }),
    onFresh: (fresh) => {
      return publishEntityValue(queryClient, MAIMAI_CATALOG_QUERY_KEY, fresh);
    },
  };
}


export async function refreshMaimaiCatalog(
  queryClient: QueryClient,
  provider: DetailedCatalogProvider | null,
  signal?: AbortSignal,
): Promise<CatalogSnapshot> {
  if (signal?.aborted) throw signal.reason ?? new Error('资源请求已取消');
  const cancel = () => { void queryClient.cancelQueries({ queryKey: MAIMAI_CATALOG_QUERY_KEY, exact: true }); };
  signal?.addEventListener('abort', cancel, { once: true });
  try {
    requireDetailedCatalogProvider(provider);
    await queryClient.invalidateQueries({ queryKey: MAIMAI_CATALOG_QUERY_KEY, refetchType: 'none' });
    if (signal?.aborted) throw signal.reason ?? new Error('资源请求已取消');
    const result = await queryClient.fetchQuery({
      queryKey: MAIMAI_CATALOG_QUERY_KEY,
      meta: { pluginId: 'game.maimai', sourcePluginId: getGameResourceSource('maimai')?.id, gameId: 'maimai' },
      queryFn: ({ signal }) => loadAliasedCatalog(maimaiCatalogOptions(queryClient, provider), signal),
      staleTime: Infinity,
    });
    if (signal?.aborted) throw signal.reason ?? new Error('资源请求已取消');
    return result;
  } finally { signal?.removeEventListener('abort', cancel); }
}


export function ensureMaimaiCatalog(queryClient: QueryClient, provider: DetailedCatalogProvider, signal?: AbortSignal): Promise<CatalogSnapshot> {
  if (signal?.aborted) return Promise.reject(signal.reason ?? new Error('资源请求已取消'));
  const options = maimaiCatalogOptions(queryClient, provider);
  const pending = queryClient.ensureQueryData({
    queryKey: MAIMAI_CATALOG_QUERY_KEY,
    meta: { pluginId: 'game.maimai', sourcePluginId: getGameResourceSource('maimai')?.id, gameId: 'maimai' },
    queryFn: ({ signal }) => loadAliasedCatalog(options, signal),
    staleTime: Infinity, gcTime: Infinity, revalidateIfStale: false,
  });
  if (!signal) return pending;
  return new Promise((resolve, reject) => {
    const cancel = () => reject(signal.reason ?? new Error('资源请求已取消'));
    signal.addEventListener('abort', cancel, { once: true });
    if (signal.aborted) cancel();
    const release = () => signal.removeEventListener('abort', cancel);
    void pending.then(value => { release(); resolve(value); }, error => { release(); reject(error); });
  });
}
