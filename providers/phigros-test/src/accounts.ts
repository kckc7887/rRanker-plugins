import type { BoundAccount } from '@rranker/sdk/account';
import type { AccountRemovalPlan } from '@rranker/sdk/plugins';
import { createMaxedPhigrosTestAccount } from '@rranker/game-phigros/accounts';
import { PhigrosDemoAccountStore } from '@rranker/provider-phigros-test/storage/phigros-demo-account-store';
const store = new PhigrosDemoAccountStore();
export async function restoreAccounts(): Promise<BoundAccount[]> { return ((profile) => profile ? [createMaxedPhigrosTestAccount(0, profile.displayName)] : [])(await store.load()); }
export async function createAccount(_gameId: string, accounts: readonly BoundAccount[], assertCurrent?: () => void): Promise<BoundAccount> {
  const existing = accounts.find(account => account.providerId === 'phigros-test');
  if (existing) return existing;
  const account = createMaxedPhigrosTestAccount();
  await store.save({ id: account.id, displayName: account.displayName }, assertCurrent);
  return account;
}
export async function removeAccount(account: BoundAccount, { submit, cleanup }: AccountRemovalPlan): Promise<void> {
  await submit('账号', () => store.remove());
}
