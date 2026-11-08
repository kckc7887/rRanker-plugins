import { resolveGameResources } from '@rranker/sdk/registry';
import type { SourceClientContext } from '@rranker/sdk/credentials';
import type { MaimaiDataSource, DetailedCatalogProvider } from '@rranker/game-maimai/data-source';
import type { ChunithmDataSource } from '@rranker/game-chunithm/data-source';
import { ChunithmPersonalService } from '@rranker/provider-lxns/services/chunithm-personal-service';
import { LxnsScoreProvider } from './providers/lxns-score-provider';
import { ChunithmScoreProvider } from './providers/chunithm-score-provider';
import { parseCredential } from './credential';
import type { LxnsTokenRotationUpdate } from './providers/lxns-oauth-request';

export function createClient(context: SourceClientContext): MaimaiDataSource | ChunithmDataSource | undefined {
  const credential = parseCredential(context.credential);
  if (!credential) return undefined;
  const rotate = (update: LxnsTokenRotationUpdate) => context.commitCredential(update.next, update.previous);
  if (context.account.gameId === 'chunithm') {
    const provider = new ChunithmScoreProvider(credential, rotate);
    const service = new ChunithmPersonalService(provider, context.account.id);
    return { readCached: () => service.loadCached(), readFresh: ({ signal }) => service.refresh(signal),
      getPlayer: signal => provider.getPlayer(signal) };
  }
  const catalogProvider = resolveGameResources('maimai') as DetailedCatalogProvider | undefined;
  if (!catalogProvider) return undefined;
  const provider = new LxnsScoreProvider(credential, rotate);
  return { scoreProvider: provider, catalogProvider, persistScores: true,
    getOptionalPlayer: signal => provider.getOptionalPlayer(signal) };
}
