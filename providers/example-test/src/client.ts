import type { SourceClientContext } from '@rranker/sdk/credentials';
import type { ExampleDataSource } from '@rranker/game-example/data-source';
import { exampleTestPayload } from './providers/example-test-provider';
export function createClient({ account }: SourceClientContext): ExampleDataSource {
  return { loadPayload: () => exampleTestPayload(account.displayName) };
}
