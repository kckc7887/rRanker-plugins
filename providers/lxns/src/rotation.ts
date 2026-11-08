import { useAccountStore } from '@rranker/sdk/state/account-store';
import { commitCredential, retryPendingRotationWrites } from '@rranker/sdk/services/session-credential-service';
import type { LxnsTokenRotationUpdate } from './providers/lxns-oauth-request';

export async function applyLxnsTokenRotation(accountId: string, update: LxnsTokenRotationUpdate) {
  await retryPendingRotationWrites();
  const account = useAccountStore.getState().boundAccounts.find(item => item.id === accountId);
  if (!account?.credentialId) return 'removed';
  return commitCredential({ credentialId: account.credentialId, providerId: 'lxns', next: update.next, expected: update.previous });
}
