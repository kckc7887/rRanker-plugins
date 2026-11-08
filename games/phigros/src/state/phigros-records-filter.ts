import { createFilterStore } from '@rranker/sdk/state/create-filter-store';
import type { PhigrosRankFilter } from '@rranker/game-phigros/domain/phigros-filters';
import type { PhigrosLevel } from '@rranker/game-phigros/domain/phigros';
import type { PhigrosXingKind } from '@rranker/game-phigros/domain/phigros-xing';

export const usePhigrosRecordsFilter = createFilterStore({
  defaults: {
    keyword: '',
    collapsed: true,
    level: 'all' as PhigrosLevel | 'all',
    constantMin: '',
    constantMax: '',
    accuracyMin: '',
    accuracyMax: '',
    rank: null as PhigrosRankFilter | null,
    xing: null as PhigrosXingKind | null,
    chapter: 'all' as string | 'all',
    selectedKyouTagIds: [] as number[],
  },
  clearKeys: [
    'keyword', 'level', 'constantMin', 'constantMax', 'accuracyMin', 'accuracyMax',
    'rank', 'xing', 'chapter', 'selectedKyouTagIds',
  ],
});
