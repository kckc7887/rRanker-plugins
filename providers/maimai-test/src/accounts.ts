import type { BoundAccount } from '@rranker/sdk/account';
import type { AccountRemovalPlan } from '@rranker/sdk/plugins';
import { createMaxedMaimaiTestAccount } from '@rranker/game-maimai/accounts';
import { DemoAccountStore } from '@rranker/provider-maimai-test/storage/demo-account-store';
const store = new DemoAccountStore();
export async function restoreAccounts(): Promise<BoundAccount[]> { return (await store.load()).map(profile => createMaxedMaimaiTestAccount(0, profile.displayName, profile.id)); }
export async function createAccount(_gameId: string, accounts: readonly BoundAccount[], assertCurrent?: () => void): Promise<BoundAccount> {
  const existing = accounts.find(account => account.providerId === 'maimai-test');
  if (existing) return existing;
  const account = createMaxedMaimaiTestAccount();
  await store.upsert({ id: account.id, displayName: account.displayName }, assertCurrent);
  return account;
}
export async function removeAccount(account: BoundAccount, { submit, cleanup }: AccountRemovalPlan): Promise<void> {
  await submit('账号', () => store.remove(account.id));
}
