import { isPluginAvailable } from '@rranker/sdk/registry';
import { captureResourceWrites } from '@rranker/sdk/services/snapshot-cache-utils';
import { parseCredential } from '../credential';
import type { Credential } from '@rranker/sdk/credentials';
import * as Crypto from 'expo-crypto';
import { createOsuBoundAccount, osuUserIdFromAccountId } from '@rranker/game-osu/accounts';
import type { BoundAccount } from '@rranker/sdk/account';
import { isOsuGameId, OSU_FAMILY, type OsuGameId } from '@rranker/game-osu';

import { ProviderError, runProviderOperation } from '@rranker/sdk/providers/errors';
import { OsuScoreProvider } from '@rranker/provider-osu/providers/osu-score-provider';
import type { OsuOAuthSession } from '@rranker/provider-osu/providers/osu-oauth';
import { SecureSessionStore } from '@rranker/sdk/storage/secure-session-store';

const sessions = new SecureSessionStore();

export type OsuBindingResult = {
  accounts: BoundAccount[];
  credentialId: string;
  session: OsuOAuthSession;
  activeAccountId: string;
};

async function createCredentialId(): Promise<string> {
  const bytes = await Crypto.getRandomBytesAsync(16);
  return `osu:${Array.from(bytes, (value) => value.toString(16).padStart(2, '0')).join('')}`;
}

function requireOsuSession(session: Credential): OsuOAuthSession {
  const parsed = parseCredential(session);
  if (!parsed) {
    throw new TypeError('复用 osu! 账号需要 OAuth 会话');
  }
  return parsed;
}

export async function bindOsuModes(input: {
  modeGameIds: readonly OsuGameId[];
  session: Credential;
  credentialId?: string;
  existingAccounts: readonly BoundAccount[];
  credentialIdsByAccountId: Readonly<Record<string, string | undefined>>;
  signal?: AbortSignal;
  assertCurrent?: () => void;
}): Promise<OsuBindingResult> {
  const gameIds = input.modeGameIds;
  const guards = ['provider.osu', ...gameIds].map(scope => captureResourceWrites(scope, input.signal));
  const assertCurrent = () => {
    for (const guard of guards) guard();
    if (gameIds.some(gameId => !isPluginAvailable('provider.osu', gameId))) throw new Error('来源已停用');
    if (input.signal?.aborted) throw input.signal.reason;
    input.assertCurrent?.();
  };
  assertCurrent();
  const initialSession = requireOsuSession(input.session);
  const modes = [...new Set(input.modeGameIds)]
    .filter((gameId): gameId is OsuGameId => (
      isOsuGameId(gameId) && OSU_FAMILY.modeGameIds.includes(gameId)
    ));
  if (modes.length === 0) {
    throw new ProviderError('authentication', '请至少选择一个 osu! 模式', false);
  }

  const provider = new OsuScoreProvider(initialSession);
  const own = await provider.getOwnUser(modes[0], input.signal);
  assertCurrent();
  const userId = own.id;

  let credentialId = input.credentialId;
  if (!credentialId) {
    const existing = input.existingAccounts.find((account) => (
      account.providerId === 'osu' && osuUserIdFromAccountId(account.id) === userId
    ));
    credentialId = existing
      ? input.credentialIdsByAccountId[existing.id]
      : undefined;
  }
  credentialId ??= await runProviderOperation('authorization_prepare', createCredentialId);
  assertCurrent();

  const accounts: BoundAccount[] = [];
  for (const gameId of modes) {
    assertCurrent();
    const user = await provider.getUser(userId, gameId, input.signal);
    assertCurrent();
    const account = createOsuBoundAccount({
      gameId,
      userId,
      displayName: user.username,
      pp: typeof user.statistics.pp === 'number' && Number.isFinite(user.statistics.pp)
        ? user.statistics.pp
        : null,
      avatarUrl: user.avatar_url ?? null,
    });
    accounts.push(account);
  }

  const finalSession = provider.getSession();
  const activeAccountId = accounts[0].id;
  await sessions.upsertAccounts(accounts.map(account => ({
    id: account.id,
    gameId: account.gameId,
    providerId: 'osu' as const,
    credentialId,
    displayName: account.displayName,
    scoreDisplay: account.scoreDisplay,
    session: finalSession,
  })), { activeAccountId, signal: input.signal, assertCurrent });
  assertCurrent();

  return {
    accounts,
    credentialId,
    session: finalSession,
    activeAccountId,
  };
}
