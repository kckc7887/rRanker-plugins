import { resolveGameResources } from '@rranker/sdk/registry';
import type { SourceClientContext } from '@rranker/sdk/credentials';
import type { MaimaiDataSource, DetailedCatalogProvider } from '@rranker/game-maimai/data-source';
import { DivingFishProvider } from './providers/diving-fish-provider';
import { parseCredential } from './credential';

export function createClient(context: SourceClientContext): (MaimaiDataSource & { scoreProvider: DivingFishProvider }) | undefined {
  const credential = parseCredential(context.credential);
  if (!credential) return undefined;
  const catalogProvider = resolveGameResources('maimai') as DetailedCatalogProvider | undefined;
  if (!catalogProvider) return undefined;
  return { scoreProvider: new DivingFishProvider(credential), catalogProvider, persistScores: true };
}
