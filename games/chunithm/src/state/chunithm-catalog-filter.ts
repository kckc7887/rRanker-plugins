import { createFilterStore } from '@rranker/sdk/state/create-filter-store';
import type { ChunithmLevelIndex } from '@rranker/game-chunithm/domain/chunithm';

export const useChunithmCatalogFilter = createFilterStore({
  defaults: {
    keyword: '',
    collapsed: true,
    difficulty: 'all' as ChunithmLevelIndex | 'all',
    version: 'all' as string | 'all',
    constantMin: '',
    constantMax: '',
  },
  clearKeys: ['keyword', 'difficulty', 'version', 'constantMin', 'constantMax'],
});
