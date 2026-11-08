import type { DataSource } from '@rranker/sdk/data';
import type { Player } from '@rranker/game-maimai/domain/models';
import type { ScoreProvider } from '@rranker/game-maimai/data-source';
import { ScoreRepository } from '@rranker/game-maimai/storage/score-repository';
import { LOCAL_MAIMAI_ACCOUNT_ID } from '@rranker/game-maimai/accounts';

function localSource(): DataSource {
  return {
    kind: 'local',
    label: '本地查分器',
    updatedAt: new Date().toISOString(),
    isStale: false,
  };
}

export class LocalMaimaiScoreProvider implements ScoreProvider {
  private readonly repository = new ScoreRepository();
  constructor(
    private readonly accountId = LOCAL_MAIMAI_ACCOUNT_ID,
    private readonly displayName = '本地玩家',
  ) {}

  private snapshot() {
    return this.repository.getLatest(this.accountId);
  }

  async getPlayer(): Promise<Player> {
    const snapshot = await this.snapshot();
    return snapshot ? {
      ...snapshot.player,
      id: this.accountId,
      displayName: this.displayName,
    } : {
      id: this.accountId,
      displayName: this.displayName,
      rating: 0,
      source: localSource(),
    };
  }

  async getRecords() {
    return (await this.snapshot())?.records ?? [];
  }
}
