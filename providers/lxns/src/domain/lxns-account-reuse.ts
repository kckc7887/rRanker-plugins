import type { Credential } from '@rranker/sdk/credentials';
import type { BoundAccount } from '@rranker/sdk/account';

import { reusableSharedCredentialAccounts } from '@rranker/sdk/domain/shared-credential-account-reuse';

export function reusableLxnsAccounts(input: {
  targetGameId: 'maimai' | 'chunithm';
  accounts: readonly BoundAccount[];
  sessionsByAccountId: Readonly<Record<string, Credential | undefined>>;
  credentialIdsByAccountId: Readonly<Record<string, string | undefined>>;
}): BoundAccount[] {
  return reusableSharedCredentialAccounts({
    providerId: 'lxns',
    sessionMode: 'lxns-oauth',
    targetGameId: input.targetGameId,
    siblingGameIds: input.targetGameId === 'maimai' ? ['chunithm'] : ['maimai'],
    accounts: input.accounts,
    sessionsByAccountId: input.sessionsByAccountId,
    credentialIdsByAccountId: input.credentialIdsByAccountId,
  });
}
