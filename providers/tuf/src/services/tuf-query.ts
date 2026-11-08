import type { QueryClient } from '@tanstack/react-query';
import type { TufPlayerSnapshot } from '@rranker/game-adofai/domain/tuf';
import { captureResourceWrites } from '@rranker/sdk/services/snapshot-cache-utils';
import { cacheFirstLoad } from '@rranker/sdk/services/cache-first';
import { publishEntityValue } from '@rranker/sdk/services/game-data-query';
import { loadTufPlayerFresh, makeTufSnapshot, TufCache } from '@rranker/provider-tuf/services/tuf-cache';
const cache = new TufCache();


export const TUF_QUERY_OPTIONS = { staleTime: 60_000, gcTime: 10 * 60_000 } as const;

export const TUF_SESSION_RESOURCE_QUERY_OPTIONS = {
  staleTime: Infinity,
  gcTime: Infinity,
  refetchOnMount: false,
  refetchOnReconnect: false,
} as const;


export function tufPlayerEntityKey(playerId: number) {
  return ['tuf', 'player', playerId, 'profile'] as const;
}


export function tufPlayerQueryOptions(queryClient: QueryClient, playerId: number) {
  const queryKey = tufPlayerEntityKey(playerId);
  return {
    meta: { pluginId: 'game.adofai', sourcePluginId: 'provider.tuf', gameId: 'adofai', accountId: `adofai:tuf:${playerId}` },
    queryKey,
    queryFn: async ({ signal }: { signal: AbortSignal }): Promise<TufPlayerSnapshot> => {
      const assertCurrent = captureResourceWrites('adofai', signal, `adofai:tuf:${playerId}`);
      const snapshot = await cacheFirstLoad({
      assertCurrent,
        loadCached: () => cache.loadPlayer(playerId),
        loadFresh: async () => {
          const player = await loadTufPlayerFresh(playerId, signal);
          const fresh = makeTufSnapshot(player);
          if (!signal.aborted) void cache.savePlayer(playerId, fresh, assertCurrent).catch(() => undefined);
          return fresh;
        },
        onFresh: (fresh) => {
          return publishEntityValue(queryClient, queryKey, fresh, assertCurrent);
        },
        signal,
      });
      return snapshot;
    },
    ...TUF_QUERY_OPTIONS,
  };
}
