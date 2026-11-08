import type { SourceClientContext } from '@rranker/sdk/credentials';
import type { ChunithmDataSource } from '@rranker/game-chunithm/data-source';
import { successfulRefresh, snapshotMetadataOf } from '@rranker/sdk/domain/refresh-result';
import { ensureChunithmCatalog } from '@rranker/game-chunithm/services/chunithm-catalog-query';
import { loadChunithmNewVersionTitles } from '@rranker/game-chunithm/services/chunithm-catalog-loader';
import { buildMaxedChunithmSnapshot } from './providers/maxed-chunithm-test-provider';
export function createClient({ account }: SourceClientContext): ChunithmDataSource {
  return { readCached: async () => null, readFresh: async ({ queryClient, signal }) => {
    const [catalog, titles] = await Promise.all([ensureChunithmCatalog(queryClient), loadChunithmNewVersionTitles(signal)]);
    const value = buildMaxedChunithmSnapshot(catalog, titles, account.displayName);
    return successfulRefresh({ value, metadata: snapshotMetadataOf(value.source), requested: ['player', 'scores', 'bests'] });
  } };
}
