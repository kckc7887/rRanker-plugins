import type { BoundAccount } from '@rranker/sdk/account';
import type { AccountRemovalPlan } from '@rranker/sdk/plugins';
import { createMaxedChunithmTestAccount } from '@rranker/game-chunithm/accounts';
import { ChunithmDemoAccountStore } from '@rranker/provider-chunithm-test/storage/chunithm-demo-account-store';
const store = new ChunithmDemoAccountStore();
export async function restoreAccounts(): Promise<BoundAccount[]> { return ((profile) => profile ? [createMaxedChunithmTestAccount(0, profile.displayName)] : [])(await store.load()); }
export async function createAccount(_gameId: string, accounts: readonly BoundAccount[], assertCurrent?: () => void): Promise<BoundAccount> {
  const existing = accounts.find(account => account.providerId === 'chunithm-test');
  if (existing) return existing;
  const account = createMaxedChunithmTestAccount();
  await store.save({ id: account.id, displayName: account.displayName }, assertCurrent);
  return account;
}
export async function removeAccount(account: BoundAccount, { submit, cleanup }: AccountRemovalPlan): Promise<void> {
  await submit('账号', () => store.remove());
}
