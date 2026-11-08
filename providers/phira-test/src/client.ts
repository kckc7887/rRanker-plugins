import type { SourceClientContext } from '@rranker/sdk/credentials';
import type { PhiraDataSource } from '@rranker/game-phira/data-source';
import { maxedPhiraPlayerSnapshot, buildMaxedPhiraBest } from './providers/maxed-phira-test-provider';
export function createClient({ account }: SourceClientContext): PhiraDataSource {
  return { createDemoBest: buildMaxedPhiraBest, playerKey: ['phira-test', account.id], bestsKey: ['phira-test', 'bests', account.id],
    readCached: async () => null, readFresh: async () => maxedPhiraPlayerSnapshot(account.displayName), readBests: async () => null };
}
