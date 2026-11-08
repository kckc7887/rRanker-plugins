import { OAuthLoginPanel } from '@rranker/sdk/components/game-content/OAuthLoginPanel';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Linking } from 'react-native';
import type { BoundAccount } from '@rranker/sdk/account';
import { boundModesOfCredential, familyForGameId } from '@rranker/sdk/domain/game-mode-family';
import { OSU_FAMILY, isOsuGameId, type OsuGameId } from '@rranker/game-osu';
import { reusablePartiallyBoundAccounts } from '@rranker/sdk/domain/shared-credential-account-reuse';
import { OsuModeSelectSheet } from '@rranker/game-osu/components/OsuModeSelectSheet';
import { providerErrorToUserMessage, runProviderOperation } from '@rranker/sdk/providers/errors';
import {
  beginOsuAuthorize,
  subscribeOsuOAuthOutcome,
  type OsuOAuthSession,
} from '@rranker/provider-osu/providers/osu-oauth';
import { bindOsuModes } from '@rranker/provider-osu/services/osu-account-binding';
import { useAppLifecycle } from '@rranker/sdk/state/app-lifecycle';
import { queryClient } from '@rranker/sdk/state/query-client';
import { useSession } from '@rranker/sdk/state/session-store';
import { useAccountBindingRequest } from '@rranker/sdk/hooks/use-account-binding-flow';
import { captureResourceWrites } from '@rranker/sdk/services/snapshot-cache-utils';
import { recordRuntimeError } from '@rranker/sdk/services/runtime-diagnostics-recorder';

export function OsuLoginPanel({
  visible,
  onSuccess,
  onBusyChange,
}: {
  visible: boolean;
  onSuccess: () => void;
  onBusyChange: (busy: boolean) => void;
}) {
  const boundAccounts = useSession((s) => s.boundAccounts);
  const sessionsByAccountId = useSession((s) => s.sessionsByAccountId);
  const credentialIdsByAccountId = useSession((s) => s.credentialIdsByAccountId);
  const bindAccounts = useSession((s) => s.bindAccounts);
  const lifecycle = useAppLifecycle();
  const reuseRequests = useAccountBindingRequest(visible, 'osu');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [showReusableAccounts, setShowReusableAccounts] = useState(false);
  const [osuModeAccount, setOsuModeAccount] = useState<BoundAccount | null>(null);

  useEffect(() => {
    onBusyChange(busy);
  }, [busy, onBusyChange]);

  useEffect(() => {
    if (lifecycle.phase === 'background') setBusy(false);
  }, [lifecycle.phase]);

  const osuReusableAccounts = useMemo(() => {
    return reusablePartiallyBoundAccounts({
      providerId: 'osu',
      sessionMode: 'osu-oauth',
      familyModeGameIds: OSU_FAMILY.modeGameIds,
      accounts: boundAccounts,
      sessionsByAccountId,
      credentialIdsByAccountId,
    });
  }, [boundAccounts, credentialIdsByAccountId, sessionsByAccountId]);

  const osuModeAccountBound = useMemo<readonly OsuGameId[]>(() => {
    if (!osuModeAccount) return [];
    const credentialId = credentialIdsByAccountId[osuModeAccount.id];
    if (!credentialId) return [];
    return [...boundModesOfCredential(boundAccounts, credentialIdsByAccountId, credentialId)]
      .filter(isOsuGameId);
  }, [boundAccounts, credentialIdsByAccountId, osuModeAccount]);

  const reset = () => {
    setMessage('');
    setBusy(false);
    setShowReusableAccounts(false);
    setOsuModeAccount(null);
  };

  useEffect(() => {
    if (!visible) reset();
  }, [visible]);

  const messageFor = (error: unknown) => providerErrorToUserMessage(error, '绑定失败，请稍后重试。', {
    authentication: '远端账号验证未通过，请重新授权。',
  });

  const invalidateAll = () => {
    void Promise.all([
      queryClient.invalidateQueries({ queryKey: ['score-snapshot'] }),
      queryClient.invalidateQueries({ queryKey: ['game-data'] }),
      queryClient.invalidateQueries({ queryKey: ['songs'] }),
    ]).catch(error => recordRuntimeError('osu-binding', error, false, { phase: 'query-refresh' }));
  };

  const openOsuAuthorize = async () => {
    setBusy(true);
    setMessage('正在打开 osu! 授权页…');
    try {
      const url = await runProviderOperation('authorization_prepare', beginOsuAuthorize);
      await runProviderOperation('authorization_open', () => Linking.openURL(url));
      setMessage('请在浏览器完成授权，完成后将选择模式并绑定。');
    } catch (error) {
      setMessage(messageFor(error));
    } finally {
      setBusy(false);
    }
  };

  const bindOsuReuse = async (selected: readonly OsuGameId[]) => {
    const account = osuModeAccount;
    const session = account ? sessionsByAccountId[account.id] : undefined;
    const credentialId = account ? credentialIdsByAccountId[account.id] : undefined;
    if (!account || session?.mode !== 'osu-oauth' || !credentialId) {
      setOsuModeAccount(null);
      setMessage('已有 osu! 账号凭据不可用，请重新授权');
      return;
    }
    const task = reuseRequests.begin();
    if (!task) return;
    const assertAccountCurrent = captureResourceWrites(account.gameId, task.signal, account.id);
    const assertCurrent = () => { task.assertCurrent(); assertAccountCurrent(); };
    setBusy(true);
    setMessage(`正在使用「${account.displayName}」绑定选中模式…`);
    try {
      const result = await runProviderOperation('verification', () => bindOsuModes({
        modeGameIds: selected,
        session,
        credentialId,
        existingAccounts: boundAccounts,
        credentialIdsByAccountId,
        signal: task.signal,
        assertCurrent,
      }));
      assertCurrent();
      await runProviderOperation('local_commit', () => bindAccounts({
        accounts: result.accounts,
        credentialId: result.credentialId,
        session: result.session as OsuOAuthSession,
        activeAccountId: result.activeAccountId,
      }));
      invalidateAll();
      reset();
      onSuccess();
    } catch (error) {
      if (task.isCurrent()) setMessage(messageFor(error));
    } finally { if (task.isCurrent()) setBusy(false); task.finish(); }
  };

  const onSuccessRef = useRef(onSuccess);
  onSuccessRef.current = onSuccess;

  useEffect(() => {
    if (!visible) return;
    return subscribeOsuOAuthOutcome((outcome) => {
      if (outcome.status === 'success' || outcome.status === 'callback-received') {
        reset();
        onSuccessRef.current();
        return;
      }
      setMessage(outcome.message);
      setBusy(false);
    });
  }, [visible]);

  return (
    <>
      <OAuthLoginPanel provider="osu" authorizeLabel="前往 osu! 授权" hint="点击后跳转浏览器完成授权，同意后返回并选择要绑定的模式。"
      message={message} busy={busy} expanded={showReusableAccounts} onToggle={() => setShowReusableAccounts(current => !current)}
      onAuthorize={() => void openOsuAuthorize()}
      accounts={osuReusableAccounts.map(account => {
        const credentialId = credentialIdsByAccountId[account.id];
        const modes = credentialId ? [...boundModesOfCredential(boundAccounts, credentialIdsByAccountId, credentialId)]
          .map(id => familyForGameId(id)?.title).filter(Boolean) : [];
        return { id: account.id, name: account.displayName, detail: '已绑定 ' + (modes.join('、') || '部分模式'), onPress: () => setOsuModeAccount(account) };
      })} />
      <OsuModeSelectSheet
        visible={osuModeAccount !== null}
        alreadyBound={osuModeAccountBound}
        busy={busy}
        onClose={() => setOsuModeAccount(null)}
        onSubmit={(selected) => void bindOsuReuse(selected)}
      />
    </>
  );
}
