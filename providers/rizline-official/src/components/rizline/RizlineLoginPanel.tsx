import { useAccountBindingRequest } from '@rranker/sdk/hooks/use-account-binding-flow';
import type { RizlineSession } from '@rranker/provider-rizline-official/credential';
import { useEffect, useRef, useState } from 'react';
import { Pressable, Text } from 'react-native';
import { PasswordLoginPanel } from '@rranker/sdk/components/game-content/PasswordLoginPanel';
import { SmsLoginPanel } from '@rranker/sdk/components/game-content/SmsLoginPanel';
import { providerLoginSheetStyles as styles } from '@rranker/sdk/components/provider-login-sheet-styles';
import { createRizlineBoundAccount } from '@rranker/game-rizline/accounts';
import type { RizlineSave } from '@rranker/game-rizline/domain/rizline';
import type { LoginCredentials } from '@rranker/sdk/providers/contracts';
import { isRizlineNeedsSmsError, RizlineProvider } from '@rranker/provider-rizline-official/providers/rizline-provider';
import { persistBoundAccountThumbnail } from '@rranker/sdk/services/account-thumbnail';
import { cacheRizlineSave } from '@rranker/provider-rizline-official/services/rizline-service';
import { captureResourceWrites } from '@rranker/sdk/services/snapshot-cache-utils';
import { cancelBoundAccountQueries } from '@rranker/sdk/services/invalidate-account-data';
import { queryClient } from '@rranker/sdk/state/query-client';
import { useSession } from '@rranker/sdk/state/session-store';
import { deleteRizlinePassword, writeRizlinePassword } from '@rranker/provider-rizline-official/storage/rizline-password-store';
import { SecureSessionStore } from '@rranker/sdk/storage/secure-session-store';
import { useAppTheme } from '@rranker/sdk/theme/app-theme';
import { useAppLifecycle } from '@rranker/sdk/state/app-lifecycle';
import { useNotification } from '@rranker/sdk/components/AppNotification';
import { providerErrorToUserMessage } from '@rranker/sdk/providers/errors';
import { recordRuntimeError } from '@rranker/sdk/services/runtime-diagnostics-recorder';

const validatePhone = (phone: string) => /^1\d{10}$/u.test(phone);

export function RizlineLoginPanel(props: { visible: boolean; onSuccess: () => void; onBusyChange: (busy: boolean) => void }) {
  const theme = useAppTheme();
  const requests = useAccountBindingRequest(props.visible, 'rizline-official', 'rizline');
  const lifecycle = useAppLifecycle();
  const { showNotification } = useNotification();
  const visible = useRef(props.visible);
  visible.current = props.visible && lifecycle.phase !== 'background';
  const passwordCleanup = useRef<AbortController | null>(null);
  const [provider] = useState(() => new RizlineProvider());
  const [method, setMethod] = useState<'sms' | 'password'>('sms');
  const [loginBusy, setLoginBusy] = useState(false);
  const [passwordClearing, setPasswordClearing] = useState(false);
  const busy = loginBusy || passwordClearing;
  const [notice, setNotice] = useState('');
  useEffect(() => {
    if (!props.visible) { setMethod('sms'); setNotice(''); }
    if (!props.visible || lifecycle.phase === 'background') {
      passwordCleanup.current?.abort(); passwordCleanup.current = null; setPasswordClearing(false);
    }
  }, [props.visible, lifecycle.phase]);
  useEffect(() => () => { visible.current = false; passwordCleanup.current?.abort(); }, []);
  const onBusyChange = props.onBusyChange;
  useEffect(() => { onBusyChange(busy); }, [busy, onBusyChange]);
  const bind = async (session: RizlineSession, player: { userId: string; username: string; totalRks: number }, save: RizlineSave, signal: AbortSignal, assertRequest: () => void, password?: string) => {
    const assertGameCurrent = captureResourceWrites('rizline', signal);
    assertGameCurrent();
    const account = createRizlineBoundAccount(player);
    const cancelling = cancelBoundAccountQueries(account, queryClient);
    let assertAccount = captureResourceWrites('rizline', signal, account.id);
    const assertCurrent = () => { assertRequest(); assertAccount(); };
    await cancelling;
    assertCurrent();
    const credentialId = await new SecureSessionStore().upsertAccount({ id: account.id,
      gameId: 'rizline', providerId: 'rizline-official', displayName: player.username,
      scoreDisplay: account.scoreDisplay, session }, signal);
    assertCurrent();
    useSession.getState().bindAccounts({ accounts: [account], session, credentialId, activeAccountId: account.id });
    assertAccount = captureResourceWrites('rizline', signal, account.id);
    const failures: string[] = [];
    const auxiliary = async (label: string, phase: string, action: () => Promise<unknown>) => {
      assertCurrent();
      try { await action(); } catch (error) {
        assertCurrent();
        failures.push(label);
        recordRuntimeError('rizline-binding', error, false, { phase });
      }
      assertCurrent();
    };
    await auxiliary('离线成绩', 'cache-save', () => cacheRizlineSave(account.id, save, signal));
    if (password !== undefined) {
      await auxiliary('密码', 'password-save', () => writeRizlinePassword(account.id, password, { signal, assertCurrent }));
    }
    await auxiliary('账号显示', 'thumbnail-save', () => persistBoundAccountThumbnail(account.id, { scoreDisplay: account.scoreDisplay }));
    await auxiliary('成绩读取', 'query-refresh', () => queryClient.invalidateQueries({ queryKey: ['game-data'] }));
    if (failures.length && visible.current) {
      showNotification({ title: '账号已绑定', message: `${failures.join('、')}暂未保存。可稍后同步成绩；密码未保存时，请重新登录以便下次续期。`, variant: 'warning' });
    }
  };
  const login = async (phone: string, code: string, signal: AbortSignal) => {
    const task = requests.begin(signal);
    if (!task) throw new Error('绑定请求已取消');
    try {
      const { session, player, save } = await provider.login(phone, code, task.signal);
      task.assertCurrent();
      await bind(session, player, save, task.signal, task.assertCurrent);
    } finally { task.finish(); }
  };
  const loginWithPassword = async (credentials: LoginCredentials, signal: AbortSignal) => {
    const task = requests.begin(signal);
    if (!task) throw new Error('绑定请求已取消');
    try {
      const { session, player, save } = await provider.loginWithPassword(credentials.username, credentials.password, task.signal);
      task.assertCurrent();
      await bind(session, player, save, task.signal, task.assertCurrent, credentials.password);
    } catch (error) {
      if (isRizlineNeedsSmsError(error) && task.isCurrent()) { setNotice('请改用验证码登录'); setMethod('sms'); }
      throw error;
    } finally { task.finish(); }
  };
  const clearPassword = async () => {
    if (busy || passwordCleanup.current || !visible.current) return;
    const state = useSession.getState();
    const account = state.boundAccounts.find((item) => item.gameId === 'rizline' && item.id === state.activeAccountId);
    if (!account) { setNotice('当前没有可清除密码的 Rizline 账号'); return; }
    const controller = new AbortController(); passwordCleanup.current = controller;
    const assertCurrent = captureResourceWrites('rizline', controller.signal, account.id);
    setPasswordClearing(true); setNotice('');
    try {
      await deleteRizlinePassword(account.id, { signal: controller.signal, assertCurrent });
      assertCurrent();
      if (visible.current) setNotice('已清除本机保存的密码');
    } catch (error) {
      let current = true;
      try { assertCurrent(); } catch { current = false; }
      if (current && visible.current) {
        recordRuntimeError('rizline-password', error, false, { phase: 'user-clear' });
        setNotice(providerErrorToUserMessage(error, '无法清除本机密码，请稍后重试。'));
      }
    } finally {
      if (passwordCleanup.current === controller) {
        passwordCleanup.current = null;
        if (visible.current) setPasswordClearing(false);
      }
    }
  };
  return <>
    {notice ? <Text accessibilityLiveRegion="polite" style={[styles.message, { color: theme.textSecondary }]}>{notice}</Text> : null}
    {method === 'sms' ? (
      <SmsLoginPanel visible={props.visible} onSuccess={props.onSuccess} onBusyChange={setLoginBusy}
        validatePhone={validatePhone} cooldownKey="rizline-official"
        sendCode={async (phone, signal) => {
          const task = requests.begin(signal);
          if (!task) throw new Error('请求已取消');
          try { await provider.sendVerificationCode(phone, task.signal); task.assertCurrent(); }
          finally { task.finish(); }
        }} login={login} />
    ) : (
      <>
      <PasswordLoginPanel visible={props.visible} disabled={passwordClearing} onSuccess={props.onSuccess} onBusyChange={setLoginBusy}
        login={loginWithPassword} usernameLabel="手机号" usernameKeyboardType="phone-pad"
        validateUsername={validatePhone} emptyMessage="请输入手机号和密码" invalidUsernameMessage="请输入正确的手机号" />
      <Text style={[styles.message, { color: theme.textMuted }]}>密码只保存在本机，用于下次续期。可以随时清除。</Text>
      <Pressable accessibilityRole="button" disabled={busy} onPress={() => void clearPassword()} style={[styles.secondary, { borderColor: theme.border, opacity: busy ? 0.5 : 1 }]}>
        <Text style={[styles.secondaryText, { color: theme.text }]}>清除本机密码</Text>
      </Pressable>
      </>
    )}
    <Text style={[styles.or, { color: theme.textMuted }]}>或</Text>
    <Pressable accessibilityRole="button" disabled={busy}
      onPress={() => { if (busy) return; setNotice(''); setMethod(current => current === 'sms' ? 'password' : 'sms'); }}
      style={[styles.secondary, { borderColor: theme.accent, opacity: busy ? 0.5 : 1 }]}>
      <Text style={[styles.secondaryText, { color: theme.accent }]}>
        {method === 'sms' ? '使用账号密码登录' : '使用验证码登录'}
      </Text>
    </Pressable>
  </>;
}
