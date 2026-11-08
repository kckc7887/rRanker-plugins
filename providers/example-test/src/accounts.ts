import { getGameProfile } from '@rranker/sdk/domain/game-profile';
import type { BoundAccount } from '@rranker/sdk/account';
import type { AccountRemovalPlan } from '@rranker/sdk/plugins';
import { catalogDemoAccountStore } from '@rranker/sdk/storage/catalog-demo-account-store';
export async function restoreAccounts(gameId: string): Promise<BoundAccount[]> {
  const stored = await catalogDemoAccountStore(gameId).load();
  return stored ? [createCatalogTestAccount(gameId, stored.displayName)] : [];
}
export async function createAccount(gameId: string, accounts: readonly BoundAccount[], assertCurrent?: () => void): Promise<BoundAccount> {
  const existing = accounts.find(account => account.id === `${gameId}:test`);
  if (existing) return existing;
  const account = createCatalogTestAccount(gameId);
  await catalogDemoAccountStore(gameId).save({ id: account.id, displayName: account.displayName }, assertCurrent);
  return account;
}
export async function removeAccount(account: BoundAccount, { submit }: AccountRemovalPlan): Promise<void> {
  await submit('账号', () => catalogDemoAccountStore(account.gameId).remove());
}

export function createCatalogTestAccount(gameId: string, displayName = '示例账号'): BoundAccount {
  return { id: `${gameId}:test`, gameId, providerId: 'example-test', displayName,
    scoreLabel: getGameProfile(gameId).ratingLabel, scoreDisplay: '19000', providerTitle: '示例账号' };
}
