import type { TufResources , AdofaiDataSource } from '@rranker/game-adofai/data-source';
import { tufProvider } from './providers/tuf-provider';
import { tufPlayerQueryOptions , tufPlayerEntityKey } from './services/tuf-query';
import type { SourceClientContext } from '@rranker/sdk/credentials';

import { tufPlayerIdFromAccountId } from '@rranker/game-adofai/accounts';
import { loadTufPlayerFresh, makeTufSnapshot, TufCache } from '@rranker/provider-tuf/services/tuf-cache';

export function createClient({ account }: SourceClientContext): AdofaiDataSource | undefined {
  const id = tufPlayerIdFromAccountId(account.id);
  if (id === null) return undefined;
  const cache = new TufCache();
  return { entityKey: tufPlayerEntityKey(id), readCached: () => cache.loadPlayer(id),
    readFresh: async signal => makeTufSnapshot(await loadTufPlayerFresh(id, signal)),
    persist: (snapshot, assertCurrent) => cache.savePlayer(id, snapshot, assertCurrent) };
}

export function createResources(): TufResources {
 return {
  loadPlayer: (queryClient, id, signal) => tufPlayerQueryOptions(queryClient, id).queryFn({ signal }),
  searchPlayers: (query, limit, offset, signal) => tufProvider.searchPlayers(query, limit, offset, signal),
  getPasses: (id, query, signal) => tufProvider.getPasses(id, query, signal),
  searchLevels: (query, signal) => tufProvider.searchLevels(query, signal),
  getLevel: (id, signal) => tufProvider.getLevel(id, signal), getLevelPasses: (id, signal) => tufProvider.getLevelPasses(id, signal),
  getVideoDetails: (url, signal) => tufProvider.getVideoDetails(url, signal), getDifficulties: signal => tufProvider.getDifficulties(signal),
 };
}
