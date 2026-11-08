import type { SourceClientContext } from '@rranker/sdk/credentials';
import type { MuseDashDataSource } from '@rranker/game-musedash/data-source';
import { ensureMuseDashAlbums, ensureMuseDashDiffdiff } from '@rranker/provider-musedash-moe/services/muse-dash-query';
import { maxedMuseDashPlayerSnapshot, maxedMuseDashPlayDetailSnapshot } from './providers/maxed-musedash-test-provider';
export function createClient({ account }: SourceClientContext): MuseDashDataSource {
  return { getPlayDetail: async () => maxedMuseDashPlayDetailSnapshot(),
    entityKey: ['musedash-test', account.id], readCached: async () => null,
    readFresh: async ({ queryClient }) => {
      const [albums, diffdiff] = await Promise.all([ensureMuseDashAlbums(queryClient), ensureMuseDashDiffdiff(queryClient)]);
      return maxedMuseDashPlayerSnapshot(albums.data, diffdiff.data, account.displayName);
    } };
}
