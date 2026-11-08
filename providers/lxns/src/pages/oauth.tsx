import { useAccountBindingRequest } from '@rranker/sdk/hooks/use-account-binding-flow';
import { useCallback, useRef, useState } from 'react';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { OAuthResultCard } from '@rranker/sdk/components/game-content/OAuthResultCard';

import { CHUNITHM_TEMP_ACCOUNT_ID } from '@rranker/game-chunithm/accounts';
import {
  exchangeLxnsAuthorizationCode,
  notifyLxnsOAuthOutcome,
  readPendingLxnsOAuth,
  requireLxnsOAuthState,
} from '@rranker/provider-lxns/providers/lxns-oauth';
import { bindLxnsAccount } from '@rranker/provider-lxns/services/lxns-account-binding';
import { ChunithmTempAccountStore } from '@rranker/provider-chunithm-temp/storage/chunithm-temp-account-store';
import { queryClient } from '@rranker/sdk/state/query-client';
import { useSession } from '@rranker/sdk/state/session-store';
import { providerErrorToUserMessage, runProviderOperation } from '@rranker/sdk/providers/errors';

const chunithmTempAccount = new ChunithmTempAccountStore();

type CallbackStatus =
  | { kind: 'processing' }
  | { kind: 'success'; accountName: string }
  | { kind: 'error'; message: string };

function messageFor(error: unknown): string {
  return providerErrorToUserMessage(error, '授权失败，请重试。', {
    authentication: '远端授权验证未通过，请重新发起授权。',
  });
}

export default function LxnsOAuthCallbackScreen() {
  const params = useLocalSearchParams<{ code?: string; state?: string; error?: string }>();
  const [status, setStatus] = useState<CallbackStatus>({ kind: 'processing' });
  const processedRef = useRef(false);
  const requests = useAccountBindingRequest(true, 'lxns');

  useFocusEffect(useCallback(() => {
    if (processedRef.current) return;
    const task = requests.begin();
    if (!task) return;
    processedRef.current = true;
    let cancelled = false;
    const controller = task;
    const assertCurrent = task.assertCurrent;

    const fail = (message: string) => {
      if (cancelled || !task.isCurrent()) return;
      setStatus({ kind: 'error', message });
      notifyLxnsOAuthOutcome({ status: 'error', message });
    };

    const run = async () => {
      if (params.error) {
        fail('落雪授权被拒绝，请重新发起授权');
        return;
      }
      const code = typeof params.code === 'string' ? params.code : '';
      if (!code) {
        fail('回调缺少授权码，请在 App 内重新发起授权');
        return;
      }
      try {
        const state = requireLxnsOAuthState(params.state);
        const pending = await runProviderOperation('credential_storage', readPendingLxnsOAuth);
        assertCurrent();
        if (!pending) {
          fail('找不到本机授权信息，请在 App 内重新发起授权');
          return;
        }
        if (pending.state !== state) {
          fail('授权状态校验失败，请重新发起授权');
          return;
        }
        const session = await runProviderOperation('authorization_callback', () => exchangeLxnsAuthorizationCode(
          code,
          state,
          controller.signal,
        ));
        assertCurrent();
        const result = await runProviderOperation('verification', () => bindLxnsAccount({
          gameId: pending.gameId, session, signal: controller.signal, assertCurrent,
        }));
        assertCurrent();
        const store = useSession.getState();
    await runProviderOperation('local_commit', () => store.bindAccounts({ accounts: [result.account], session: result.session,
      credentialId: result.credentialId, activeAccountId: result.account.id }));
        assertCurrent();
        if (result.account.gameId === 'chunithm') {
          await runProviderOperation('local_commit', () => store.removeBoundAccount(CHUNITHM_TEMP_ACCOUNT_ID));
          assertCurrent();
          await chunithmTempAccount.remove().catch(() => undefined);
          assertCurrent();
        }
        assertCurrent();
        void queryClient.invalidateQueries({ queryKey: ['score-snapshot'] });
        void queryClient.invalidateQueries({ queryKey: ['game-data'] });
        void queryClient.invalidateQueries({ queryKey: ['songs'] });
        assertCurrent();
        setStatus({ kind: 'success', accountName: result.account.displayName });
        notifyLxnsOAuthOutcome({
          status: 'success',
          gameId: pending.gameId,
          accountName: result.account.displayName,
        });
      } catch (error) {
        fail(messageFor(error));
      }
    };

    void run().finally(task.finish);
    return () => { cancelled = true; requests.cancel(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 每个回调只消费一次；离焦或卸载取消本次请求。
  }, []));

  if (status.kind === 'processing') return <OAuthResultCard busy title="正在完成落雪授权…" message="正在换取令牌并绑定账号，请稍候。" />;
  return <OAuthResultCard result={status} />;
}
