import { calculateChartRating } from '@rranker/game-maimai/domain/rating';
import type { CatalogSnapshot, Player, ScoreRecord } from '@rranker/game-maimai/domain/models';
import type { CatalogDrivenScoreProvider } from '@rranker/game-maimai/data-source';
import { generatedSource } from '@rranker/sdk/providers/generated-source';
import { MAIMAI_TEST_ACCOUNT_ID } from '@rranker/game-maimai/accounts';
import { buildMaxedScoreRecords } from '@rranker/sdk/providers/maxed-records';

export function buildMaxedMaimaiRecords(catalog: CatalogSnapshot): ScoreRecord[] {
  return buildMaxedScoreRecords(catalog, {
    achievements: 101,
    dxScore: (chart) => (chart.notes && typeof chart.notes.total === 'number'
      ? chart.notes.total * 3
      : null),
    rating: (chart) => calculateChartRating(chart.difficultyConstant, 101),
    fc: 'app',
    fs: 'fsdp',
    rate: 'sssp',
  });
}

export class MaxedMaimaiTestProvider implements CatalogDrivenScoreProvider {
  constructor(
    private readonly accountId = MAIMAI_TEST_ACCOUNT_ID,
    private readonly displayName = '示例账号',
  ) {}

  async getPlayer(): Promise<Player> {
    return {
      id: this.accountId,
      displayName: this.displayName,
      rating: 0,
      extension: { kind: 'maimai', courseRank: 23 },
      source: generatedSource(),
    };
  }

  async getRecordsFromCatalog(catalog: CatalogSnapshot): Promise<ScoreRecord[]> {
    return buildMaxedMaimaiRecords(catalog);
  }
}
