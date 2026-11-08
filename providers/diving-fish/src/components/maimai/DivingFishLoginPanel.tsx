import type { Credential } from '@rranker/sdk/credentials';
import { useEffect, useState } from 'react';
import { Pressable, Text, TextInput } from 'react-native';
import { createMaimaiBoundAccount } from '@rranker/game-maimai/accounts';
import { DivingFishAuthProvider } from '@rranker/provider-diving-fish/providers/diving-fish-auth';
import { DivingFishProvider } from '@rranker/provider-diving-fish/providers/diving-fish-provider';
import { ProviderError, providerErrorToUserMessage } from '@rranker/sdk/providers/errors';

import { validateAndActivateSession } from '@rranker/provider-diving-fish/services/session-validation';
import { SecureSessionStore } from '@rranker/sdk/storage/secure-session-store';
import { useAppLifecycle } from '@rranker/sdk/state/app-lifecycle';
import { queryClient } from '@rranker/sdk/state/query-client';
import { useSession } from '@rranker/sdk/state/session-store';
import { useAppTheme } from '@rranker/sdk/theme/app-theme';
import { providerLoginSheetStyles as styles } from '@rranker/sdk/components/provider-login-sheet-styles';
import { useAccountBindingRequest } from '@rranker/sdk/hooks/use-account-binding-flow';
import { captureResourceWrites } from '@rranker/sdk/services/snapshot-cache-utils';
import { cancelBoundAccountQueries } from '@rranker/sdk/services/invalidate-account-data';
import { recordRuntimeError } from '@rranker/sdk/services/runtime-diagnostics-recorder';

const auth = new DivingFishAuthProvider();
const sessions = new SecureSessionStore();

export function DivingFishLoginPanel({
  visible,
  onSuccess,
  onBusyChange,
}: {
  visible: boolean;
  onSuccess: () => void;
  onBusyChange: (busy: boolean) => void;
}) {
  const theme = useAppTheme();
  const bindAccounts = useSession((s) => s.bindAccounts);
  const lifecycle = useAppLifecycle();
  const requests = useAccountBindingRequest(visible, 'diving-fish', 'maimai');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [importToken, setImportToken] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    onBusyChange(busy);
  }, [busy, onBusyChange]);

  const reset = () => {
    setUsername('');
    setPassword('');
    setImportToken('');
    setMessage('');
    setBusy(false);
  };

  useEffect(() => {
    if (!visible || lifecycle.phase === 'background') reset();
  }, [visible, lifecycle.phase]);

  const messageFor = (error: unknown) => providerErrorToUserMessage(error, '验证失败，请稍后重试。');

  const invalidateAll = () => {
    void Promise.all([
      queryClient.invalidateQueries({ queryKey: ['score-snapshot'] }),
      queryClient.invalidateQueries({ queryKey: ['game-data'] }),
      queryClient.invalidateQueries({ queryKey: ['songs'] }),
    ]).catch(error => recordRuntimeError('diving-fish-binding', error, false, { phase: 'query-refresh' }));
  };

  const validateAndActivate = async (newSession: Credential, signal: AbortSignal, assertRequest: () => void) => {
    const providerId = 'diving-fish' as const;
    let credentialId = '';
    const assertGameCurrent = captureResourceWrites('maimai', signal);
    let assertAccountCurrent: () => void = () => undefined;
    const assertCurrent = () => { assertRequest(); assertGameCurrent(); assertAccountCurrent(); };
    try {
      await validateAndActivateSession(newSession, {
        signal,
        assertCurrent,
        createProvider: (session) => (
          new DivingFishProvider(session)
        ),
        save: async (sessionToSave, player) => {
          const account = createMaimaiBoundAccount({
            providerId,
            displayName: player.displayName,
            rating: player.rating,
            playerId: player.id,
          });
          const cancelling = cancelBoundAccountQueries(account, queryClient);
          assertAccountCurrent = captureResourceWrites('maimai', signal, account.id);
          await cancelling;
          assertCurrent();
          credentialId = await sessions.upsertAccount({
            id: account.id,
            gameId: 'maimai',
            providerId,
            displayName: account.displayName,
            scoreDisplay: account.scoreDisplay,
            session: sessionToSave,
          }, signal);
          assertCurrent();
        },
        activate: (sessionToActivate, player) => {
          const account = createMaimaiBoundAccount({ providerId, displayName: player.displayName, rating: player.rating, playerId: player.id });
          bindAccounts({ accounts: [account], session: sessionToActivate,
            credentialId: credentialId || `credential:${account.id}`, activeAccountId: account.id });
          invalidateAll();
        },
      });
    } catch (error) {
      if (newSession.mode === 'cookie-jar' && error instanceof ProviderError && error.code === 'authentication') {
        throw new ProviderError('authentication', 'iOS login session missing', false, { cause: error });
      }
      throw error;
    }
  };

  const login = async () => {
    if (!username.trim() || !password) { setMessage('请输入水鱼用户名和密码'); return; }
    const task = requests.begin();
    if (!task) return;
    const assertGameCurrent = captureResourceWrites('maimai', task.signal);
    const assertCurrent = () => { task.assertCurrent(); assertGameCurrent(); };
    setBusy(true); setMessage('正在登录并获取上传凭证…');
    try {
      const newSession = await auth.loginWithPassword({ username: username.trim(), password }, task.signal);
      assertCurrent();
      await validateAndActivate(newSession, task.signal, assertCurrent);
      reset();
      onSuccess();
    } catch (error) { if (task.isCurrent()) { setMessage(messageFor(error)); setPassword(''); } }
    finally { if (task.isCurrent()) setBusy(false); task.finish(); }
  };

  const connectWithToken = async () => {
    const task = requests.begin();
    if (!task) return;
    setBusy(true); setMessage('正在验证上传凭证…');
    try {
      const newSession = auth.useImportToken(importToken);
      await validateAndActivate(newSession, task.signal, task.assertCurrent);
      reset();
      onSuccess();
    } catch (error) { if (task.isCurrent()) setMessage(messageFor(error)); }
    finally { if (task.isCurrent()) setBusy(false); task.finish(); }
  };

  return (
    <>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      <TextInput
        autoCapitalize="none"
        autoCorrect={false}
        textContentType="none"
        autoComplete="off"
        importantForAutofill="no"
        editable={!busy}
        placeholder="用户名"
        value={username}
        onChangeText={setUsername}
        placeholderTextColor={theme.textMuted}
        style={[styles.input, { backgroundColor: theme.input, borderColor: theme.border, color: theme.text }]}
      />
      <TextInput
        autoCapitalize="none"
        autoCorrect={false}
        textContentType="oneTimeCode"
        autoComplete="one-time-code"
        importantForAutofill="no"
        editable={!busy}
        placeholder="密码"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        placeholderTextColor={theme.textMuted}
        style={[styles.input, { backgroundColor: theme.input, borderColor: theme.border, color: theme.text }]}
      />
      <Pressable
        disabled={busy}
        onPress={() => void login()}
        style={({ pressed }) => [styles.primary, { backgroundColor: theme.accent }, pressed && !busy && styles.primaryPressed]}
      >
        <Text style={[styles.primaryText, { color: theme.onAccent }]}>账密登录并验证</Text>
      </Pressable>
      <Text style={styles.or}>或</Text>
      <TextInput
        autoCapitalize="none"
        autoCorrect={false}
        textContentType="oneTimeCode"
        autoComplete="off"
        editable={!busy}
        placeholder="上传凭证"
        secureTextEntry
        value={importToken}
        onChangeText={setImportToken}
        placeholderTextColor={theme.textMuted}
        style={[styles.input, { backgroundColor: theme.input, borderColor: theme.border, color: theme.text }]}
      />
      <Pressable
        disabled={busy}
        onPress={() => void connectWithToken()}
        style={({ pressed }) => [styles.secondary, { borderColor: theme.accent }, pressed && !busy && styles.secondaryPressed]}
      >
        <Text style={[styles.secondaryText, { color: theme.accent }]}>验证并保存凭证</Text>
      </Pressable>
    </>
  );
}
