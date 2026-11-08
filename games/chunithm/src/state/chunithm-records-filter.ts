import { createFilterStore } from '@rranker/sdk/state/create-filter-store';
import type { ChunithmLevelIndex } from '@rranker/game-chunithm/domain/chunithm';
import type { ChunithmRank } from '@rranker/game-chunithm/domain/chunithm-score-presentation';

export const useChunithmRecordsFilter = createFilterStore({
  defaults: {
    keyword: '',
    collapsed: true,
    difficulty: 'all' as ChunithmLevelIndex | 'all',
    version: 'all' as string | 'all',
    constantMin: '',
    constantMax: '',
    rankMin: null as ChunithmRank | null,
    rankMax: null as ChunithmRank | null,
  },
  clearKeys: ['keyword', 'difficulty', 'version', 'constantMin', 'constantMax', 'rankMin', 'rankMax'],
});
