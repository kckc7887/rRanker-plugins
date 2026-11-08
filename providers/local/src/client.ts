import { resolveGameResources } from '@rranker/sdk/registry';
import type { SourceClientContext } from '@rranker/sdk/credentials';
import type { MaimaiDataSource, DetailedCatalogProvider } from '@rranker/game-maimai/data-source';
import { LocalMaimaiScoreProvider } from './providers/local-score-provider';
export function createClient({ account }: SourceClientContext): MaimaiDataSource | undefined {
  const catalogProvider = resolveGameResources('maimai') as DetailedCatalogProvider | undefined;
  if (!catalogProvider) return undefined;
  return { scoreProvider: new LocalMaimaiScoreProvider(account.id, account.displayName), catalogProvider, persistScores: true, local: true };
}
