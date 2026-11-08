import type { BoundAccount } from '@rranker/sdk/account';
import type { AccountRemovalPlan } from '@rranker/sdk/plugins';
import { createChunithmTempAccount } from '@rranker/game-chunithm/accounts';
import { ChunithmTempAccountStore } from '@rranker/provider-chunithm-temp/storage/chunithm-temp-account-store';
const store = new ChunithmTempAccountStore();
export async function restoreAccounts(_gameId: string, accounts: readonly Pick<BoundAccount, 'id' | 'gameId' | 'providerId'>[]): Promise<BoundAccount[]> {
  if (accounts.some(account => account.gameId === 'chunithm' && account.providerId === 'lxns')) return [];
  return await store.load() ? [createChunithmTempAccount()] : [];
}
export async function createAccount(_gameId: string, _accounts: readonly BoundAccount[], assertCurrent?: () => void): Promise<BoundAccount> { await store.enable(assertCurrent); return createChunithmTempAccount(); }
export async function removeAccount(_account: BoundAccount, { submit }: AccountRemovalPlan): Promise<void> { await submit('账号', () => store.remove()); }
