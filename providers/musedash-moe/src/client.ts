import type { MuseDashResources , MuseDashDataSource } from '@rranker/game-musedash/data-source';
import { museDashProvider } from './providers/muse-dash-provider';
import { loadMuseDashAlbumsFresh, loadMuseDashCeFresh, loadMuseDashDiffdiffFresh , loadMuseDashPlayDetailFresh, loadMuseDashPlayerFresh, makeMuseDashSnapshot, MuseDashCache } from './services/muse-dash-cache';
import { museDashPlayerQueryOptions, refreshMuseDashSessionResources , museDashPlayerEntityKey } from './services/muse-dash-query';
import type { SourceClientContext } from '@rranker/sdk/credentials';

import { museDashUserIdFromAccountId } from '@rranker/game-musedash/accounts';


export function createClient({ account }: SourceClientContext): MuseDashDataSource | undefined {
  const userId = museDashUserIdFromAccountId(account.id);
  if (userId === null) return undefined;
  const cache = new MuseDashCache();
  return { getPlayDetail: async (uid, difficulty, platform, signal) => makeMuseDashSnapshot(await loadMuseDashPlayDetailFresh(uid, difficulty, platform, userId, signal)),
    entityKey: museDashPlayerEntityKey(userId), readCached: () => cache.loadPlayer(userId),
    readFresh: async ({ signal }) => makeMuseDashSnapshot(await loadMuseDashPlayerFresh(userId, signal)),
    persist: (snapshot, assertCurrent) => cache.savePlayer(userId, snapshot, assertCurrent) };
}

export function createResources(): MuseDashResources {
 return {
  loadPlayer: (queryClient, id, signal) => museDashPlayerQueryOptions(queryClient, id).queryFn({ signal }),
  loadAlbums: async signal => makeMuseDashSnapshot(await loadMuseDashAlbumsFresh(signal)),
  loadCe: async signal => makeMuseDashSnapshot(await loadMuseDashCeFresh(signal)),
  loadDiffdiff: async signal => makeMuseDashSnapshot(await loadMuseDashDiffdiffFresh(signal)),
  refresh: refreshMuseDashSessionResources,
  searchPlayers: (query, signal) => museDashProvider.searchPlayers(query, signal), getPlayer: (id, signal) => museDashProvider.getPlayer(id, signal),
  getPlayDetail: (uid, difficulty, platform, id, signal) => museDashProvider.getPlayDetail(uid, difficulty, platform, id, signal),
  getAlbums: signal => museDashProvider.getAlbums(signal), getCe: signal => museDashProvider.getCe(signal), getDiffdiff: signal => museDashProvider.getDiffdiff(signal),
 };
}
