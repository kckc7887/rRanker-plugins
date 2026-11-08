import { useAccountBindingRequest } from '@rranker/sdk/hooks/use-account-binding-flow';
import { createMajdataBoundAccount } from '@rranker/game-majdata-net/accounts';
import { PasswordLoginPanel } from '@rranker/sdk/components/game-content/PasswordLoginPanel';
import { majdataAvatarUrl } from '@rranker/game-majdata-net/domain/majdata';
import { persistBoundAccountThumbnail } from '@rranker/sdk/services/account-thumbnail';
import { MajdataProvider } from '@rranker/provider-majdata-net/providers/majdata-provider';
import type { LoginCredentials } from '@rranker/sdk/providers/contracts';
import { SecureSessionStore } from '@rranker/sdk/storage/secure-session-store';
import { useSession } from '@rranker/sdk/state/session-store';
import { queryClient } from '@rranker/sdk/state/query-client';

async function login(credentials: LoginCredentials, signal: AbortSignal, assertCurrent: () => void) {
  const provider = new MajdataProvider();
  const session = await provider.login(credentials, signal);
  const player = await provider.getPlayer(signal);
  assertCurrent();
  const id = `majdata-net:account:${player.username.toLowerCase()}`;
  const previous = useSession.getState().boundAccounts.find(account => account.id === id);
  const credentialId = await new SecureSessionStore().upsertAccount({ id, gameId: 'majdata-net', providerId: 'majdata-net',
    displayName: player.username, scoreDisplay: previous?.scoreDisplay ?? '—', session }, signal);
  assertCurrent();
  const account = createMajdataBoundAccount({ accountId: id, displayName: player.username,
    avatarUrl: majdataAvatarUrl(player.username), scoreDisplay: previous?.scoreDisplay });
  useSession.getState().bindAccounts({ accounts: [account], session, credentialId, activeAccountId: account.id });
  void persistBoundAccountThumbnail(id, { avatarUrl: majdataAvatarUrl(player.username), ...(previous ? { scoreDisplay: previous.scoreDisplay } : {}) }).catch(() => undefined);
  await queryClient.invalidateQueries({ queryKey: ['game-data'] });
}
export function MajdataLoginPanel(props: { visible: boolean; onSuccess: () => void; onBusyChange: (busy: boolean) => void }) {
  const requests = useAccountBindingRequest(props.visible, 'majdata-net', 'majdata-net');
  return <PasswordLoginPanel {...props} login={async (credentials, signal) => {
    const task = requests.begin(signal);
    if (!task) throw new Error('绑定请求已取消');
    try { await login(credentials, task.signal, task.assertCurrent); } finally { task.finish(); }
  }} />;
}
