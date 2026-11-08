import type { BoundAccount } from '@rranker/sdk/account';
import type { AccountCleanupAttempt } from '@rranker/sdk/plugins';
import { SqliteSnapshotRepository } from '@rranker/sdk/storage/sqlite-snapshot-repository';
import { chunithmPersonalResourceKey } from '@rranker/game-chunithm/domain/chunithm-personal';
const repository = new SqliteSnapshotRepository();
export async function cleanupAccount(account: BoundAccount, cleanup: AccountCleanupAttempt): Promise<void> {
  if (account.gameId === 'chunithm') await cleanup('成绩缓存', () => repository.deleteResource(chunithmPersonalResourceKey(account.id)));
}
