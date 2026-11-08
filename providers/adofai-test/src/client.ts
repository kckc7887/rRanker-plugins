import type { SourceClientContext } from '@rranker/sdk/credentials';
import type { AdofaiDataSource } from '@rranker/game-adofai/data-source';
import { maxedTufPlayerSnapshot, buildMaxedTufPass } from './providers/maxed-tuf-test-provider';
export function createClient({ account }: SourceClientContext): AdofaiDataSource {
  return { createDemoPass: buildMaxedTufPass, entityKey: ['adofai-test', account.id], readCached: async () => null,
    readFresh: async () => maxedTufPlayerSnapshot(account.displayName),
    playerScore: { label: 'RANKED SCORE', value: 114514, display: '114514' } };
}
