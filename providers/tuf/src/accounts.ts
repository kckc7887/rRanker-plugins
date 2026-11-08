import type { BoundAccount } from '@rranker/sdk/account';
import type { AccountRemovalPlan } from '@rranker/sdk/plugins';
import { createTufBoundAccount, tufPlayerIdFromAccountId } from '@rranker/game-adofai/accounts';
import { TufAccountStore } from '@rranker/provider-tuf/storage/tuf-account-store';
import { TufCache } from '@rranker/provider-tuf/services/tuf-cache';
const store = new TufAccountStore();
export async function restoreAccounts(): Promise<BoundAccount[]> { return (await store.load()).map(createTufBoundAccount); }
export async function removeAccount(account: BoundAccount, { submit, cleanup }: AccountRemovalPlan): Promise<void> {
  const id = tufPlayerIdFromAccountId(account.id);
  if (id === null) return;
  await submit('账号', () => store.remove(id));
  await cleanup('缓存', () => new TufCache().clearPlayer(id));
}
