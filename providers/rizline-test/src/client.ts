import type { SourceClientContext } from '@rranker/sdk/credentials';
import type { RizlineDataSource } from '@rranker/game-rizline/data-source';
import { ensureRizlineCatalog } from '@rranker/game-rizline/services/rizline-catalog-query';
import { buildMaxedRizlineSnapshot } from './providers/maxed-rizline-test-provider';
export function createClient({ account }: SourceClientContext): RizlineDataSource {
  return { applyCatalog: (catalog, snapshot) => buildMaxedRizlineSnapshot(catalog, snapshot.save.username), readCached: async () => null, readFresh: async ({ queryClient }) =>
    buildMaxedRizlineSnapshot((await ensureRizlineCatalog(queryClient)).snapshot, account.displayName) };
}
