import type { SourceClientContext } from '@rranker/sdk/credentials';
import { parseCredential, type RizlineSession } from '@rranker/provider-rizline-official/credential';
import type { RizlineSave, RizlineSnapshot } from '@rranker/game-rizline/domain/rizline';
import { rizlineUserIdFromAccountId } from '@rranker/game-rizline/accounts';

import { isRizlineTokenExpired, RizlineProvider, RizlineSaveSchema } from '@rranker/provider-rizline-official/providers/rizline-provider';
import { z } from 'zod';
import { ProviderError } from '@rranker/sdk/providers/errors';
import { deleteRizlinePassword, hasRizlinePassword, readRizlinePassword } from '@rranker/provider-rizline-official/storage/rizline-password-store';
import { SqliteSnapshotRepository } from '@rranker/sdk/storage/sqlite-snapshot-repository';
import { recordRuntimeError } from '@rranker/sdk/services/runtime-diagnostics-recorder';
import { cacheSourceSchema, captureResourceWrites, createInflightGuard, invalidateResourceWrites, resourceWriteGeneration, snapshotSource } from '@rranker/sdk/services/snapshot-cache-utils';
import {
  cachedSnapshotSource,
  cancelledRefresh,
  failedRefresh,
  refreshFailureFromError,
  refreshNeedsLogin,
  snapshotMetadataOf,
  successfulRefresh,
  type RefreshResult,
} from '@rranker/sdk/domain/refresh-result';

const repository = new SqliteSnapshotRepository();
const loads = createInflightGuard<string>();
const snapshotSchema = z.object({ save: RizlineSaveSchema, source: cacheSourceSchema('rizline-official') });
export const rizlineAccountKey = (id: string) => `rizline:account:${id}`;
export function loadRizlineCached(id: string): Promise<RizlineSnapshot | null> { return repository.getResource(rizlineAccountKey(id), 2,
  snapshotSchema.refine(snapshot => snapshot.save.userId === rizlineUserIdFromAccountId(id))); }
export async function clearRizlineAccount(id: string): Promise<void> {
  invalidateResourceWrites(`account:${id}`);
  await repository.clearResources([rizlineAccountKey(id)]);
}
export async function cacheRizlineSave(id: string, save: RizlineSave, signal?: AbortSignal): Promise<RizlineSnapshot> {
  const assertCurrent = captureResourceWrites('rizline', signal, id);
  assertCurrent();
  if (rizlineUserIdFromAccountId(id) !== save.userId) throw new ProviderError('authentication', 'Rizline account mismatch', false);
  const snapshot = { save, source: snapshotSource({ kind: 'rizline-official', label: '官方账号' }) };
  await repository.saveResource(rizlineAccountKey(id), 2, snapshot.source.updatedAt, snapshot, assertCurrent);
  assertCurrent();
  return snapshot;
}

function latestRizlineSession(context: SourceClientContext): RizlineSession {
  context.assertCurrent();
  const current = parseCredential(context.credential);
  if (!current) throw new ProviderError('authentication', '登录已失效，请重新登录', false);
  return current;
}

function isAuthenticationError(error: unknown): error is ProviderError {
  return error instanceof ProviderError && error.code === 'authentication';
}

export async function loadRizlineFresh(context: SourceClientContext, signal?: AbortSignal): Promise<RizlineSnapshot> {
  const id = context.account.id;
  const key = `${resourceWriteGeneration('rizline')}:${resourceWriteGeneration(`account:${id}`)}:${id}`;
  return loads.share(key, async requestSignal => {
    const assertGeneration = captureResourceWrites('rizline', requestSignal, id);
    const assertCurrent = () => { assertGeneration(); context.assertCurrent(); };
    let expected = latestRizlineSession(context);
    if (isRizlineTokenExpired(expected.token) && !(await hasRizlinePassword(id))) {
      throw new ProviderError('authentication', '登录已失效，请重新登录', false);
    }
    const getSave = async (current: RizlineSession) => {
      expected = current;
      const provider = new RizlineProvider({
        session: current,
        allowExpiredToken: true,
        onSessionChanged: async next => {
          assertCurrent();
          await context.commitCredential(next, expected);
          assertCurrent();
          expected = latestRizlineSession(context);
        },
      });
      return provider.getSave(requestSignal);
    };
    const reauthWithPassword = async (error: ProviderError): Promise<RizlineSave> => {
      const password = await readRizlinePassword(id);
      if (!password) throw error;
      try {
        const current = latestRizlineSession(context);
        const provider = new RizlineProvider({ session: current });
        const result = await provider.loginWithPassword(current.phone, password, requestSignal);
        assertCurrent();
        await context.commitCredential(result.session, expected);
        assertCurrent();
        expected = latestRizlineSession(context);
        return result.save;
      } catch (reauthError) {
        if (isAuthenticationError(reauthError)) {
          try { await deleteRizlinePassword(id, { signal: requestSignal, assertCurrent }); }
          catch (cleanupError) { recordRuntimeError('rizline-password', cleanupError, false, { phase: 'authentication-cleanup' }); }
        }
        throw reauthError;
      }
    };
    let save: RizlineSave;
    try {
      save = await getSave(expected);
    } catch (error) {
      if (!isAuthenticationError(error)) throw error;
      const storeSession = latestRizlineSession(context);
      if (storeSession.token !== expected.token) {
        try { save = await getSave(storeSession); }
        catch (retryError) {
          if (!isAuthenticationError(retryError)) throw retryError;
          save = await reauthWithPassword(retryError);
        }
      } else {
        save = await reauthWithPassword(error);
      }
    }
    assertCurrent();
    return cacheRizlineSave(id, save, requestSignal);
  }, signal);
}

type RizlineRefreshAttempt = { result: RefreshResult<RizlineSnapshot, string>; error: unknown };

async function refreshRizline(
  context: SourceClientContext,
  signal?: AbortSignal,
): Promise<RizlineRefreshAttempt> {
  const id = context.account.id;
  const assertGeneration = captureResourceWrites('rizline', signal, id);
  const assertCurrent = () => { assertGeneration(); context.assertCurrent(); };
  try {
    const snapshot = await loadRizlineFresh(context, signal);
    assertCurrent();
    return {
      error: null,
      result: successfulRefresh<RizlineSnapshot, string>({
        value: snapshot, metadata: snapshotMetadataOf(snapshot.source), requested: [id],
      }),
    };
  } catch (error) {
    if (signal?.aborted) return { error, result: cancelledRefresh<RizlineSnapshot, string>([id]) };
    assertCurrent();
    const failure = refreshFailureFromError(error, id);
    const cached = await loadRizlineCached(id);
    assertCurrent();
    if (!cached) {
      return { error, result: failedRefresh<RizlineSnapshot, string>({ requested: [id], failures: [failure] }) };
    }
    const metadata = snapshotMetadataOf(cached.source);
    return {
      error,
      result: failedRefresh<RizlineSnapshot, string>({
        value: { ...cached, source: cachedSnapshotSource(cached.source) },
        metadata,
        requested: [id],
        failures: [failure],
      }),
    };
  }
}

export async function refreshRizlineSnapshot(
  context: SourceClientContext,
  signal?: AbortSignal,
): Promise<RefreshResult<RizlineSnapshot, string>> {
  return (await refreshRizline(context, signal)).result;
}

export function loadRizlineWithFallback(context: SourceClientContext, signal?: AbortSignal): Promise<RizlineSnapshot> {
  const pending = (async () => {
    const { result, error } = await refreshRizline(context, signal);
    if (result.status === 'cancelled') throw signal?.reason ?? error ?? new Error('操作已取消');
    if (!result.value) throw error ?? new Error('Rizline 存档读取失败');
    return { ...result.value, requiresLogin: refreshNeedsLogin(result) };
  })();
  return pending;
}
