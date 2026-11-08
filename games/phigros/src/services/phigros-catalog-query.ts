import type { QueryClient } from '@tanstack/react-query';
import { phigrosResources } from '@rranker/game-phigros/services/phigros-resources';
import type { CatalogSnapshot } from '@rranker/game-phigros/domain/models';
import { mapPhigrosKyouAliases, type PhigrosKyouAliasesSnapshot } from '@rranker/game-phigros/domain/phigros-kyou';

import { aliasedCatalogSource, loadAliasedCatalog, type AliasedCatalogOptions } from '@rranker/sdk/services/aliased-catalog-query';
import type { PhigrosResources } from '@rranker/game-phigros/data-source';
import { getGameResourceSource, resolveGameResources } from '@rranker/sdk/registry';
import { normalizeSearchText } from '@rranker/sdk/utils/search';


export const PHIGROS_CATALOG_QUERY_KEY = ['phigros-catalog'] as const;

export function phigrosCatalogProvider(): PhigrosResources {
  const provider = resolveGameResources('phigros') as PhigrosResources | undefined;
  if (!provider) throw new Error('Phigros 曲库来源不可用');
  return provider;
}

let catalogRevision: string | undefined;

export type PhigrosCatalogData = { snapshot: CatalogSnapshot; provider: PhigrosResources };


function mergeAliasLists(existing: readonly string[] | undefined, incoming: readonly string[] | undefined): string[] {
  const result: string[] = [];
  const seen = new Set<string>();
  for (const alias of [...(existing ?? []), ...(incoming ?? [])]) {
    const normalized = normalizeSearchText(alias.normalize('NFKC').trim());
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    result.push(alias.normalize('NFKC').trim());
  }
  return result;
}


export function phigrosCatalogOptions(
  queryClient: QueryClient,
  provider: PhigrosResources | undefined = resolveGameResources('phigros') as PhigrosResources | undefined,
  enabled?: boolean,
): AliasedCatalogOptions<CatalogSnapshot, PhigrosKyouAliasesSnapshot, PhigrosCatalogData> {
  return {
    enabled: enabled !== false && provider !== undefined,
    meta: { pluginId: 'game.phigros', sourcePluginId: getGameResourceSource('phigros')?.id, gameId: 'phigros' },
    retry: false,
    queryKey: PHIGROS_CATALOG_QUERY_KEY,
    loadCached: async () => null,
    loadCatalog: async (signal) => {
      const release = await phigrosResources.load(signal, true);
      if (!provider) throw new Error('Phigros 曲库来源不可用');
      const catalog = await provider.getCatalog(signal, true);
      if (catalogRevision !== release.revision) {
        catalogRevision = release.revision;
        void queryClient.invalidateQueries({
          predicate: (query) => query.queryKey[0] === 'game-data' && query.queryKey[3] === 'phigros',
        });
      }
      return catalog;
    },
    loadAliases: signal => provider?.loadAliases?.(signal) ?? Promise.reject(new Error('Phigros 别名来源不可用')),
    mergeAliases: (catalog, aliasSnapshot) => {
      if (!aliasSnapshot) return catalog;
      const aliases = new Map(mapPhigrosKyouAliases(aliasSnapshot, catalog).aliases
        .map((item) => [item.songId, item.aliases]));
      return {
        ...catalog,
        songs: catalog.songs.map((song) => ({
          ...song,
          aliases: mergeAliasLists(song.aliases, aliases.get(song.id)),
        })),
      };
    },
    composeSource: (catalog, aliasSnapshot) => aliasedCatalogSource(catalog, aliasSnapshot, {
      stale: '（含缓存别名）',
      aliasMissing: '（别名暂不可用）',
    }, { includeCatalogStale: false }),
    wrapData: (catalog) => {
      if (!provider) throw new Error('Phigros 曲库来源不可用');
      return { snapshot: catalog, provider };
    },
    onFresh: () => undefined,
  };
}


export function ensurePhigrosCatalog(queryClient: QueryClient, provider: PhigrosResources = phigrosCatalogProvider()): Promise<PhigrosCatalogData> {
  const options = phigrosCatalogOptions(queryClient, provider);
  return queryClient.fetchQuery({
    queryKey: PHIGROS_CATALOG_QUERY_KEY,
    meta: { pluginId: 'game.phigros', sourcePluginId: getGameResourceSource('phigros')?.id, gameId: 'phigros' },
    queryFn: ({ signal }) => loadAliasedCatalog(options, signal),
    staleTime: Infinity,
    gcTime: Infinity,
    retry: false,
  });
}


export async function refreshPhigrosCatalog(queryClient: QueryClient, signal?: AbortSignal): Promise<PhigrosCatalogData> {
  if (signal?.aborted) throw signal.reason ?? new Error('资源请求已取消');
  const cancel = () => { void queryClient.cancelQueries({ queryKey: PHIGROS_CATALOG_QUERY_KEY, exact: true }); };
  signal?.addEventListener('abort', cancel, { once: true });
  try {
    await queryClient.invalidateQueries({ queryKey: PHIGROS_CATALOG_QUERY_KEY, refetchType: 'none' });
    if (signal?.aborted) throw signal.reason ?? new Error('资源请求已取消');
    const result = await queryClient.fetchQuery({
      queryKey: PHIGROS_CATALOG_QUERY_KEY,
      meta: { pluginId: 'game.phigros', sourcePluginId: getGameResourceSource('phigros')?.id, gameId: 'phigros' },
      queryFn: ({ signal }) => loadAliasedCatalog(phigrosCatalogOptions(queryClient), signal),
      staleTime: Infinity, gcTime: Infinity, retry: false,
    });
    if (signal?.aborted) throw signal.reason ?? new Error('资源请求已取消');
    return result;
  } finally { signal?.removeEventListener('abort', cancel); }
}
