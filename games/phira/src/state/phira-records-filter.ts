import { createFilterStore } from '@rranker/sdk/state/create-filter-store';
import type { PhiraRankFilter , PhiraScoreSort } from '@rranker/game-phira/domain/phira-filters';
import type { PhiraXingKind } from '@rranker/game-phira/domain/phira-score-presentation';

export const usePhiraRecordsFilter = createFilterStore({
  defaults: {
    keyword: '',
    collapsed: true,
    constantMin: '',
    constantMax: '',
    accuracyMin: '',
    accuracyMax: '',
    rank: null as PhiraRankFilter | null,
    xing: null as PhiraXingKind | null,
    sort: 'score' as PhiraScoreSort,
  },
  clearKeys: [
    'keyword', 'collapsed', 'constantMin', 'constantMax', 'accuracyMin', 'accuracyMax',
    'rank', 'xing', 'sort',
  ],
});
