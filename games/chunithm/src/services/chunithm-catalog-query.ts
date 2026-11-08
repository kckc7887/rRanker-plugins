import { getGameResourceSource } from '@rranker/sdk/registry';
import type { QueryClient } from '@tanstack/react-query';
import { chunithmAliasesForSong, type ChunithmAliasSnapshot, type ChunithmCatalogSnapshot } from '@rranker/game-chunithm/domain/chunithm';
import { CHUNITHM_CATALOG_QUERY_KEY, loadChunithmAliases, loadChunithmCatalog } from '@rranker/game-chunithm/services/chunithm-catalog-loader';
import { aliasedCatalogSource, loadAliasedCatalog, type AliasedCatalogOptions } from '@rranker/sdk/services/aliased-catalog-query';
import { publishEntityValue } from '@rranker/sdk/services/game-data-query';


function mergeChunithmAliases(
  catalog: ChunithmCatalogSnapshot,
  aliasSnapshot: ChunithmAliasSnapshot | null | undefined,
): ChunithmCatalogSnapshot {
  const aliases = new Map(aliasSnapshot?.aliases.map((item) => [item.songId, item.aliases]) ?? []);
  return {
    ...catalog,
    songs: catalog.songs.map((song) => ({
      ...song,
      aliases: chunithmAliasesForSong(song.id, aliases),
    })),
  };
}


export function chunithmCatalogOptions(
  queryClient: QueryClient,
  enabled?: boolean,
): AliasedCatalogOptions<ChunithmCatalogSnapshot, ChunithmAliasSnapshot, ChunithmCatalogSnapshot> {
  return {
    meta: { pluginId: 'game.chunithm', sourcePluginId: getGameResourceSource('chunithm')?.id, gameId: 'chunithm' },
    enabled,
    queryKey: CHUNITHM_CATALOG_QUERY_KEY,
    loadCached: async () => null,
    loadCatalog: loadChunithmCatalog,
    loadAliases: loadChunithmAliases,
    mergeAliases: mergeChunithmAliases,
    composeSource: (catalog, aliasSnapshot) => aliasedCatalogSource(catalog, aliasSnapshot, {
      stale: '（含缓存资源）',
      aliasMissing: '（别名暂不可用）',
    }),
    onFresh: (fresh) => {
      publishEntityValue(queryClient, CHUNITHM_CATALOG_QUERY_KEY, fresh);
    },
  };
}


export async function refreshChunithmCatalog(queryClient: QueryClient, signal?: AbortSignal): Promise<ChunithmCatalogSnapshot> {
  if (signal?.aborted) throw signal.reason ?? new Error('资源请求已取消');
  const cancel = () => { void queryClient.cancelQueries({ queryKey: CHUNITHM_CATALOG_QUERY_KEY, exact: true }); };
  signal?.addEventListener('abort', cancel, { once: true });
  try {
    const options = chunithmCatalogOptions(queryClient);
    await queryClient.invalidateQueries({ queryKey: CHUNITHM_CATALOG_QUERY_KEY, refetchType: 'none' });
    if (signal?.aborted) throw signal.reason ?? new Error('资源请求已取消');
    const result = await queryClient.fetchQuery({
      queryKey: CHUNITHM_CATALOG_QUERY_KEY,
      meta: { pluginId: 'game.chunithm', sourcePluginId: getGameResourceSource('chunithm')?.id, gameId: 'chunithm' },
      queryFn: ({ signal }) => loadAliasedCatalog(options, signal),
      staleTime: Infinity,
    });
    if (signal?.aborted) throw signal.reason ?? new Error('资源请求已取消');
    return result;
  } finally { signal?.removeEventListener('abort', cancel); }
}


export function ensureChunithmCatalog(queryClient: QueryClient): Promise<ChunithmCatalogSnapshot> {
  const options = chunithmCatalogOptions(queryClient);
  return queryClient.ensureQueryData({
    queryKey: CHUNITHM_CATALOG_QUERY_KEY,
    meta: { pluginId: 'game.chunithm', sourcePluginId: getGameResourceSource('chunithm')?.id, gameId: 'chunithm' },
    queryFn: ({ signal }) => loadAliasedCatalog(options, signal),
    staleTime: Infinity,
    gcTime: Infinity,
    revalidateIfStale: false,
  });
}