import type { QueryClient } from '@tanstack/react-query';
import type { DataSource } from '@rranker/sdk/data';
import type { MuseDashPlayer } from '@rranker/game-musedash/domain/muse-dash';
import { cacheFirstLoad } from '@rranker/sdk/services/cache-first';
import { captureResourceWrites } from '@rranker/sdk/services/snapshot-cache-utils';
import { publishEntityValue } from '@rranker/sdk/services/game-data-query';
import { loadMuseDashAlbumsFresh, loadMuseDashDiffdiffFresh, loadMuseDashPlayerFresh, makeMuseDashSnapshot, MuseDashCache } from '@rranker/provider-musedash-moe/services/muse-dash-cache';
const cache = new MuseDashCache();


export const MUSE_DASH_QUERY_OPTIONS = { staleTime: 60_000, gcTime: 10 * 60_000 } as const;

export const MUSE_DASH_SESSION_RESOURCE_QUERY_OPTIONS = {
  staleTime: Infinity,
  gcTime: Infinity,
  refetchOnMount: false,
  refetchOnReconnect: false,
} as const;


function museDashSessionResourceQueryOptions<T>(
  queryKey: readonly unknown[],
  load: (signal: AbortSignal) => Promise<T>,
) {
  return {
    meta: { pluginId: 'game.musedash', sourcePluginId: 'provider.musedash-moe', gameId: 'musedash' },
    queryKey,
    queryFn: async ({ signal }: { signal: AbortSignal }): Promise<MuseDashSnapshot<T>> => (
      makeMuseDashSnapshot(await load(signal))
    ),
    ...MUSE_DASH_SESSION_RESOURCE_QUERY_OPTIONS,
  } as const;
}


export async function refreshMuseDashSessionResources(queryClient: QueryClient): Promise<void> {
  await queryClient.invalidateQueries({ predicate: query => query.queryKey[0] === 'musedash' && ['albums', 'ce', 'diffdiff'].includes(String(query.queryKey[1])), refetchType: 'none' });
}


export function ensureMuseDashAlbums(queryClient: QueryClient) {
  return queryClient.ensureQueryData(museDashSessionResourceQueryOptions(
    ['musedash', 'albums'],
    loadMuseDashAlbumsFresh,
  ));
}


export function ensureMuseDashDiffdiff(queryClient: QueryClient) {
  return queryClient.ensureQueryData(museDashSessionResourceQueryOptions(
    ['musedash', 'diffdiff'],
    loadMuseDashDiffdiffFresh,
  ));
}


export type MuseDashSnapshot<T> = { data: T; source: DataSource };


export function museDashPlayerEntityKey(userId: string) {
  return ['musedash', 'player', userId] as const;
}


export function museDashPlayerQueryOptions(queryClient: QueryClient, userId: string) {
  const queryKey = museDashPlayerEntityKey(userId);
  return {
    meta: { pluginId: 'game.musedash', sourcePluginId: 'provider.musedash-moe', gameId: 'musedash', accountId: `musedash:musedash-moe:${userId}` },
    queryKey,
    queryFn: async ({ signal }: { signal: AbortSignal }): Promise<MuseDashSnapshot<MuseDashPlayer>> => {
      const assertCurrent = captureResourceWrites('musedash', signal, `musedash:musedash-moe:${userId}`);
      return cacheFirstLoad({
        assertCurrent,
        loadCached: () => cache.loadPlayer(userId),
        loadFresh: async () => {
          const player = await loadMuseDashPlayerFresh(userId, signal);
          const fresh = makeMuseDashSnapshot(player);
          if (!signal.aborted) void cache.savePlayer(userId, fresh, assertCurrent).catch(() => undefined);
          return fresh;
        },
        onFresh: (fresh) => {
          return publishEntityValue(queryClient, queryKey, fresh, assertCurrent);
        },
        signal,
      });
    },
    ...MUSE_DASH_QUERY_OPTIONS,
  };
}
