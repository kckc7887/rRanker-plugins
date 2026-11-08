import type { SourceSyncContext } from '@rranker/sdk/data-load';
import type { AccountSummary, GameDataBundle } from '@rranker/sdk/data';
import type { PhigrosGameDataPayload } from '@rranker/game-phigros/domain/game-data';
import type { PhigrosDataSource } from '@rranker/game-phigros/data-source';
import { gameDataQueryKey } from '@rranker/sdk/services/game-data-query';
import { resolvePhigrosAvatarUrl } from '@rranker/game-phigros/services/phigros-avatar-resolver';
import { PhigrosSaveCache } from '@rranker/provider-phi-taptap/services/phigros-save-cache';
import { parseCredential } from './credential';

const cache = new PhigrosSaveCache();
const fromPayload = (payload: PhigrosGameDataPayload): AccountSummary => ({
  scoreDisplay: payload.playerScore.value.toFixed(4), displayName: payload.player.displayName,
  storedDisplayName: payload.player.displayName, avatarUrl: payload.avatarUrl ?? null,
  displayData: { challengeModeRank: payload.challengeModeRank },
});

export async function hydrateAccount({ account, credential, client, queryClient, signal, assertCurrent }: SourceSyncContext): Promise<AccountSummary | undefined> {
  if (!parseCredential(credential)) return;
  const current = () => {
    const bundle = queryClient.getQueryData<GameDataBundle>(gameDataQueryKey(account.id, 'phigros', 'phi-taptap', 'phi-session'));
    return bundle?.payload.kind === 'phigros' ? bundle.payload : null;
  };
  const committed = current();
  if (committed) return fromPayload(committed);
  const stored = await cache.load(account.id);
  assertCurrent();
  const available = current() ?? stored;
  if (available) return fromPayload(available);
  const provider = client as PhigrosDataSource | undefined;
  if (!provider?.getSummary) return;
  const summary = await provider.getSummary(signal);
  const avatarUrl = await resolvePhigrosAvatarUrl(summary.avatar, signal);
  assertCurrent();
  const latest = current();
  return latest ? fromPayload(latest) : { scoreDisplay: summary.rankingScore.toFixed(4),
    displayName: account.displayName, storedDisplayName: account.displayName, avatarUrl,
    displayData: { challengeModeRank: summary.challengeModeRank } };
}
