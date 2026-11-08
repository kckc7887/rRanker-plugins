import type { SourceClientContext } from '@rranker/sdk/credentials';
import type { PhigrosDataSource } from '@rranker/game-phigros/data-source';
import { loadPhigrosGameData } from '@rranker/provider-phi-taptap/services/phigros-game-data-service';
import { PhigrosSaveCache } from '@rranker/provider-phi-taptap/services/phigros-save-cache';
import { phigrosCatalogProvider } from '@rranker/game-phigros/services/phigros-catalog-query';
import { PhigrosScoreProvider } from './providers/phigros-score-provider';
import { parseCredential } from './credential';

export function createClient(context: SourceClientContext): PhigrosDataSource | undefined {
  const credential = parseCredential(context.credential);
  if (!credential) return undefined;
  const provider = new PhigrosScoreProvider(credential), cache = new PhigrosSaveCache();
  return { loadPayload: ({ hasSessionData, signal, assertCurrent }) => loadPhigrosGameData({ accountId: context.account.id,
    scoreProvider: provider, catalogProvider: phigrosCatalogProvider(), cache, hasSessionData, signal, assertCurrent }),
    getSummary: signal => provider.getSummary(signal), getSaveUpdatedAt: () => provider.getSaveUpdatedAt(),
    getPushRecommendations: (delta, chartCost, includePhi, signal) => provider.getPushRecommendations(delta, chartCost, includePhi, signal) };
}
