import { createFilterStore } from '@rranker/sdk/state/create-filter-store';
import type { PhigrosLevel } from '@rranker/game-phigros/domain/phigros';

export const usePhigrosCatalogFilter = createFilterStore({
  defaults: {
    keyword: '',
    collapsed: true,
    level: 'all' as PhigrosLevel | 'all',
    constantMin: '',
    constantMax: '',
    chapter: 'all' as string | 'all',
    selectedKyouTagIds: [] as number[],
  },
  clearKeys: ['keyword', 'level', 'constantMin', 'constantMax', 'chapter', 'selectedKyouTagIds'],
});
