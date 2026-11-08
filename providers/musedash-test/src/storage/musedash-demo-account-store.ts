import { MUSEDASH_TEST_ACCOUNT_ID } from '@rranker/game-musedash/accounts';
import { createDemoAccountStore, type DemoAccountProfile } from '@rranker/sdk/storage/create-demo-account-store';

export type MuseDashDemoAccountProfile = DemoAccountProfile;

const { Store } = createDemoAccountStore({
  storeKey: 'rranker.musedash-demo-account.v1',
  isTestAccountId: isMuseDashDemoAccountId,
  saveErrorMessage: '喵斯快跑示例账号名称不能为空',
});

export function isMuseDashDemoAccountId(accountId: string): boolean {
  return accountId === MUSEDASH_TEST_ACCOUNT_ID;
}

export const MuseDashDemoAccountStore = Store;
