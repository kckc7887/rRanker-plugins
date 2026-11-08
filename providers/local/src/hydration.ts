import type { SourceSyncContext } from '@rranker/sdk/data-load';
import type { AccountSummary } from '@rranker/sdk/data';
import { formatPlayerScore } from '@rranker/sdk/data';
import { getGameProfile } from '@rranker/sdk/domain/game-profile';
import { ScoreRepository } from '@rranker/game-maimai/storage/score-repository';

const scores = new ScoreRepository();
export async function hydrateAccount({ account, assertCurrent }: SourceSyncContext): Promise<AccountSummary | undefined> {
  const snapshot = await scores.getLatest(account.id);
  assertCurrent();
  return snapshot ? { scoreDisplay: formatPlayerScore(snapshot.best50.rating ?? 0, getGameProfile('maimai').ratingDigits) } : undefined;
}
