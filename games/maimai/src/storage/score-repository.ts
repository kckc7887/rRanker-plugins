import type { ScoreSnapshot } from '@rranker/game-maimai/domain/models';
import { ScoreSnapshotSchema } from '@rranker/game-maimai/domain/schemas';
import { SqliteSnapshotRepository } from '@rranker/sdk/storage/sqlite-snapshot-repository';

const SCORE_SCHEMA_VERSION = 5;

export class ScoreRepository extends SqliteSnapshotRepository {
  getLatest(accountId: string): Promise<ScoreSnapshot | null> {
    return this.getAccountScore(accountId, SCORE_SCHEMA_VERSION, ScoreSnapshotSchema);
  }

  save(accountId: string, snapshot: ScoreSnapshot, assertCurrent?: () => void): Promise<void> {
    return this.saveAccountScore(accountId, SCORE_SCHEMA_VERSION, snapshot.source.updatedAt, snapshot, assertCurrent);
  }
}
