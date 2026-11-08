import type { SourceSyncContext } from '@rranker/sdk/data-load';
import type { createClient } from './client';
import { ensureMaimaiCatalog } from '@rranker/game-maimai/services/maimai-catalog-query';
import { buildScoreSnapshot } from '@rranker/game-maimai/services/score-service';
import { ScoreRepository } from '@rranker/game-maimai/storage/score-repository';
import { formatPlayerScore } from '@rranker/sdk/data';
import { getGameProfile } from '@rranker/sdk/domain/game-profile';
import { commitAccountMetadata } from '@rranker/sdk/services/account-metadata';

const scores = new ScoreRepository();
export async function sync({ account, credential, client, queryClient, signal, assertCurrent }: SourceSyncContext): Promise<void> {
  if (credential?.mode !== 'import-token') return;
  const source = client as ReturnType<typeof createClient>;
  if (!source) throw new Error('水鱼账号不可用');
  const catalog = await ensureMaimaiCatalog(queryClient, source.catalogProvider, signal);
  assertCurrent();
  const [player, records] = await Promise.all([source.scoreProvider.getPlayer(signal), source.scoreProvider.getRecords(signal)]);
  assertCurrent();
  const snapshot = buildScoreSnapshot(player, records, catalog);
  await scores.save(account.id, snapshot, assertCurrent);
  await commitAccountMetadata(account.id, { scoreDisplay: formatPlayerScore(snapshot.best50.rating, getGameProfile('maimai').ratingDigits),
    displayName: snapshot.player.displayName, storedDisplayName: snapshot.player.displayName }, assertCurrent);
}
