import type { BoundAccount } from '@rranker/sdk/account';
import type { AccountRemovalPlan } from '@rranker/sdk/plugins';
import { createAdditionalLocalMaimaiAccountId, createLocalMaimaiAccount, LOCAL_MAIMAI_ACCOUNT_ID } from '@rranker/game-maimai/accounts';
import { LocalAccountStore, normalizeLocalPlayerName } from '@rranker/provider-local/storage/local-account-store';
import { useAccountStore } from '@rranker/sdk/state/account-store';
import { queryClient } from '@rranker/sdk/state/query-client';
import { patchMaimaiPlayerDisplayName } from './services/player-display';
const store = new LocalAccountStore();
export async function restoreAccounts(): Promise<BoundAccount[]> {
  return (await store.load()).map(profile => createLocalMaimaiAccount(profile.displayName, 0, profile.id));
}
export async function createAccount(_gameId: string, accounts: readonly BoundAccount[], assertCurrent?: () => void): Promise<BoundAccount> {
  const count = accounts.filter(account => account.providerId === 'local').length;
  const account = createLocalMaimaiAccount(count === 0 ? '本地玩家' : `本地玩家 ${count + 1}`, 0,
    count === 0 ? LOCAL_MAIMAI_ACCOUNT_ID : createAdditionalLocalMaimaiAccountId(accounts.map(item => item.id)));
  await store.upsert({ id: account.id, displayName: account.displayName }, assertCurrent);
  return account;
}
export async function removeAccount(account: BoundAccount, { submit }: AccountRemovalPlan): Promise<void> {
  await submit('账号', () => store.remove(account.id));
}
export async function renameAccount(account: BoundAccount, value: string): Promise<void> {
  const displayName = normalizeLocalPlayerName(value);
  if (!displayName) throw new Error('名称不能为空');
  await store.upsert({ id: account.id, displayName });
  useAccountStore.getState().renameLocalAccount(account.id, displayName);
  patchMaimaiPlayerDisplayName(account.id, displayName, queryClient);
}
