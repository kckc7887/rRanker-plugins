import type { BoundAccount } from '@rranker/sdk/account';
import type { AccountRemovalPlan } from '@rranker/sdk/plugins';
import { createPhiraBoundAccount, phiraPlayerIdFromAccountId } from '@rranker/game-phira/accounts';
import { PhiraAccountStore } from '@rranker/provider-phira-community/storage/phira-account-store';
import { PhiraCache } from '@rranker/provider-phira-community/services/phira-cache';
const store = new PhiraAccountStore();
export async function restoreAccounts(): Promise<BoundAccount[]> { return (await store.load()).map(createPhiraBoundAccount); }
export async function removeAccount(account: BoundAccount, { submit, cleanup }: AccountRemovalPlan): Promise<void> {
  const id = phiraPlayerIdFromAccountId(account.id);
  if (id === null) return;
  await submit('账号', () => store.remove(id));
  await cleanup('缓存', () => new PhiraCache().clearPlayer(id));
}
