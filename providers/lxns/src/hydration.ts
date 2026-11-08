import type { SourceSyncContext } from '@rranker/sdk/data-load';
import type { AccountSummary, GameDataBundle } from '@rranker/sdk/data';
import type { ChunithmDataSource } from '@rranker/game-chunithm/data-source';
import type { MaimaiDataSource } from '@rranker/game-maimai/data-source';
import { buildLxnsIconUrl } from '@rranker/game-maimai/domain/account-avatar';
import { buildChunithmMapIconUrl, CHUNITHM_PERSONAL_SNAPSHOT_SCHEMA_VERSION, ChunithmPersonalSnapshotSchema,
  chunithmPersonalResourceKey } from '@rranker/game-chunithm/domain/chunithm-personal';
import { ScoreRepository } from '@rranker/game-maimai/storage/score-repository';
import { SqliteSnapshotRepository } from '@rranker/sdk/storage/sqlite-snapshot-repository';
import { gameDataQueryKey } from '@rranker/sdk/services/game-data-query';
import { parseCredential } from './credential';

const scores = new ScoreRepository();
const resources = new SqliteSnapshotRepository();

export async function hydrateAccount({ account, credential, client, queryClient, signal, assertCurrent }: SourceSyncContext): Promise<AccountSummary | undefined> {
  const current = () => queryClient.getQueryData<GameDataBundle>(gameDataQueryKey(account.id, account.gameId, 'lxns', 'lxns-oauth'));
  if (account.gameId === 'chunithm') {
    const currentPlayer = () => { const bundle = current(); return bundle?.payload.kind === 'chunithm' ? bundle.payload.player : undefined; };
    let player = currentPlayer();
    if (player === undefined) {
      const stored = await resources.getResource(chunithmPersonalResourceKey(account.id), CHUNITHM_PERSONAL_SNAPSHOT_SCHEMA_VERSION, ChunithmPersonalSnapshotSchema);
      assertCurrent();
      player = currentPlayer() ?? stored?.player;
    }
    if (!player && parseCredential(credential)) player = await (client as ChunithmDataSource | undefined)?.getPlayer?.(signal) ?? undefined;
    assertCurrent();
    if (!player) return;
    return { scoreDisplay: player.rating.toFixed(2), displayName: player.name, storedDisplayName: player.name,
      avatarUrl: buildChunithmMapIconUrl(player.map_icon?.id) ?? undefined, displayData: { ratingPossession: player.rating_possession ?? null } };
  }
  if (account.gameId !== 'maimai') return;
  const currentPlayer = () => { const bundle = current(); return bundle?.payload.kind === 'maimai' ? bundle.payload.player : undefined; };
  let player = currentPlayer();
  if (!player) {
    const stored = await scores.getLatest(account.id);
    assertCurrent();
    player = currentPlayer() ?? stored?.player;
  }
  if (!buildLxnsIconUrl(player?.presentation?.iconId) && parseCredential(credential)) {
    player = await (client as MaimaiDataSource | undefined)?.scoreProvider.getPlayer(signal);
  }
  assertCurrent();
  const avatarUrl = buildLxnsIconUrl(currentPlayer()?.presentation?.iconId ?? player?.presentation?.iconId);
  return avatarUrl ? { scoreDisplay: account.scoreDisplay, avatarUrl } : undefined;
}
