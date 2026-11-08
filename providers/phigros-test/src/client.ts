import type { SourceClientContext } from '@rranker/sdk/credentials';
import type { PhigrosDataSource } from '@rranker/game-phigros/data-source';
import { phigrosPayloadFromSnapshot } from '@rranker/game-phigros/domain/game-data';
import { ensurePhigrosCatalog, phigrosCatalogProvider } from '@rranker/game-phigros/services/phigros-catalog-query';
import { buildMaxedPhigrosSnapshot } from './providers/maxed-phigros-test-provider';
export function createClient({ account }: SourceClientContext): PhigrosDataSource {
  return { loadPayload: async ({ queryClient, assertCurrent }) => {
    const catalog = (await ensurePhigrosCatalog(queryClient, phigrosCatalogProvider())).snapshot;
    assertCurrent();
    return phigrosPayloadFromSnapshot(buildMaxedPhigrosSnapshot(catalog, account.displayName), catalog.source);
  } };
}
