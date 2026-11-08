import { isPluginAvailable } from '@rranker/sdk/registry';
import { captureResourceWrites } from '@rranker/sdk/services/snapshot-cache-utils';
import { parseCredential } from '../credential';
import type { Credential } from '@rranker/sdk/credentials';
import * as Crypto from 'expo-crypto';
import {
  buildChunithmMapIconUrl,
  CHUNITHM_PERSONAL_SNAPSHOT_SCHEMA_VERSION,
  chunithmPersonalResourceKey,
  type ChunithmPersonalSnapshot,
} from '@rranker/game-chunithm/domain/chunithm-personal';
import { createChunithmBoundAccount } from '@rranker/game-chunithm/accounts';
import { createMaimaiBoundAccount } from '@rranker/game-maimai/accounts';
import type { BoundAccount } from '@rranker/sdk/account';

import { ChunithmScoreProvider } from '@rranker/provider-lxns/providers/chunithm-score-provider';
import type { LxnsOAuthSession } from '@rranker/provider-lxns/providers/lxns-oauth';
import { LxnsScoreProvider } from '@rranker/provider-lxns/providers/lxns-score-provider';
import { SecureSessionStore } from '@rranker/sdk/storage/secure-session-store';
import { runProviderOperation } from '@rranker/sdk/providers/errors';
import { SqliteSnapshotRepository } from '@rranker/sdk/storage/sqlite-snapshot-repository';

const sessions = new SecureSessionStore();
const snapshots = new SqliteSnapshotRepository();

export type LxnsBindingResult = {
  account: BoundAccount;
  credentialId: string;
  session: LxnsOAuthSession;
  chunithmSnapshot?: ChunithmPersonalSnapshot;
};

async function createCredentialId(): Promise<string> {
  const bytes = await Crypto.getRandomBytesAsync(16);
  return `lxns:${Array.from(bytes, (value) => value.toString(16).padStart(2, '0')).join('')}`;
}

function requireLxnsSession(session: Credential): LxnsOAuthSession {
  const parsed = parseCredential(session);
  if (!parsed) {
    throw new TypeError('复用落雪账号需要 OAuth 会话');
  }
  return parsed;
}

export async function bindLxnsAccount(input: {
  gameId: 'maimai' | 'chunithm';
  session: Credential;
  credentialId?: string;
  signal?: AbortSignal;
  assertCurrent?: () => void;
}): Promise<LxnsBindingResult> {
  const gameIds = [input.gameId];
  const guards = ['provider.lxns', ...gameIds].map(scope => captureResourceWrites(scope, input.signal));
  const assertCurrent = () => {
    for (const guard of guards) guard();
    if (gameIds.some(gameId => !isPluginAvailable('provider.lxns', gameId))) throw new Error('来源已停用');
    if (input.signal?.aborted) throw input.signal.reason ?? Object.assign(new Error('绑定请求已取消'), { name: 'AbortError' });
    input.assertCurrent?.();
  };
  assertCurrent();
  const initialSession = requireLxnsSession(input.session);
  const credentialId = input.credentialId ?? await runProviderOperation('authorization_prepare', createCredentialId);
  assertCurrent();

  if (input.gameId === 'maimai') {
    const provider = new LxnsScoreProvider(initialSession);
    const [player] = await Promise.all([
      provider.getOptionalPlayer(input.signal),
      provider.getOptionalRecords(input.signal),
    ]);
    assertCurrent();
    const created = createMaimaiBoundAccount({
      accountId: player ? undefined : `maimai:lxns:${credentialId}`,
      providerId: 'lxns',
      displayName: player?.displayName ?? '落雪账号（待同步）',
      rating: player?.rating ?? 0,
      playerId: player?.id ?? credentialId,
    });
    const account = player ? created : { ...created, scoreDisplay: '—' };
    const finalSession = provider.getSession();
    await sessions.upsertAccounts([{
      id: account.id,
      gameId: 'maimai',
      providerId: 'lxns',
      credentialId,
      displayName: account.displayName,
      scoreDisplay: account.scoreDisplay,
      session: finalSession,
    }], { activeAccountId: account.id, signal: input.signal, assertCurrent });
    assertCurrent();
    return { account, credentialId, session: finalSession };
  }

  const provider = new ChunithmScoreProvider(initialSession);
  const snapshot = await provider.getSnapshot(input.signal);
  assertCurrent();
  const player = snapshot.player;
  const account = createChunithmBoundAccount({
    accountId: player ? undefined : `chunithm:lxns:${credentialId}`,
    displayName: player?.name ?? '落雪账号（待同步）',
    rating: player?.rating ?? null,
    playerId: player ? String(player.friend_code) : credentialId,
    avatarUrl: buildChunithmMapIconUrl(player?.map_icon?.id),
    ratingPossession: player?.rating_possession ?? null,
  });
  const finalSession = provider.getSession();
  await runProviderOperation('local_commit', () => snapshots.saveResource(
    chunithmPersonalResourceKey(account.id),
    CHUNITHM_PERSONAL_SNAPSHOT_SCHEMA_VERSION,
    snapshot.source.updatedAt,
    snapshot,
    assertCurrent,
  ));
  assertCurrent();
  await sessions.upsertAccounts([{
    id: account.id,
    gameId: 'chunithm',
    providerId: 'lxns',
    credentialId,
    displayName: account.displayName,
    scoreDisplay: account.scoreDisplay,
    displayData: account.displayData,
    session: finalSession,
  }], { activeAccountId: account.id, signal: input.signal, assertCurrent });
  assertCurrent();
  return {
    account,
    credentialId,
    session: finalSession,
    chunithmSnapshot: snapshot,
  };
}
