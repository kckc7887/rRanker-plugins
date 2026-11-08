import type { BoundAccount } from '@rranker/sdk/account';
import type { AccountRemovalPlan } from '@rranker/sdk/plugins';
import { MuseDashCache } from '@rranker/provider-musedash-moe/services/muse-dash-cache';
import { MUSEDASH_TEST_USER_ID, createMaxedMuseDashTestAccount } from '@rranker/game-musedash/accounts';
import { MuseDashDemoAccountStore } from '@rranker/provider-musedash-test/storage/musedash-demo-account-store';
const store = new MuseDashDemoAccountStore();
export async function restoreAccounts(): Promise<BoundAccount[]> { return ((profile) => profile ? [createMaxedMuseDashTestAccount(0, profile.displayName)] : [])(await store.load()); }
export async function createAccount(_gameId: string, accounts: readonly BoundAccount[], assertCurrent?: () => void): Promise<BoundAccount> {
  const existing = accounts.find(account => account.providerId === 'musedash-test');
  if (existing) return existing;
  const account = createMaxedMuseDashTestAccount();
  await store.save({ id: account.id, displayName: account.displayName }, assertCurrent);
  return account;
}
export async function removeAccount(account: BoundAccount, { submit, cleanup }: AccountRemovalPlan): Promise<void> {
  await submit('账号', () => store.remove());
  await cleanup('缓存', () => new MuseDashCache().clearPlayer(MUSEDASH_TEST_USER_ID));
}
