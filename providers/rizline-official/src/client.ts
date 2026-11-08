import type { SourceClientContext } from '@rranker/sdk/credentials';
import type { RizlineDataSource } from '@rranker/game-rizline/data-source';
import { loadRizlineCached, loadRizlineWithFallback } from '@rranker/provider-rizline-official/services/rizline-service';
import { parseCredential } from './credential';

export function createClient(context: SourceClientContext): RizlineDataSource {
  const credential = parseCredential(context.credential);
  return { readCached: () => loadRizlineCached(context.account.id),
    ...(credential ? { readFresh: ({ signal }: { signal: AbortSignal }) => loadRizlineWithFallback(context, signal) } : {}) };
}
