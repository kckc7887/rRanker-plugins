import type { BoundAccount } from '@rranker/sdk/account';
import type { AccountRemovalPlan } from '@rranker/sdk/plugins';
import { createMuseDashBoundAccount, museDashUserIdFromAccountId } from '@rranker/game-musedash/accounts';
import { MuseDashAccountStore } from '@rranker/provider-musedash-moe/storage/musedash-account-store';
import { MuseDashCache } from '@rranker/provider-musedash-moe/services/muse-dash-cache';
const store = new MuseDashAccountStore();
export async function restoreAccounts(): Promise<BoundAccount[]> { return (await store.load()).map(createMuseDashBoundAccount); }
export async function removeAccount(account: BoundAccount, { submit, cleanup }: AccountRemovalPlan): Promise<void> {
  const id = museDashUserIdFromAccountId(account.id);
  if (id === null) return;
  await submit('账号', () => store.remove(id));
  await cleanup('缓存', () => new MuseDashCache().clearPlayer(id));
}
