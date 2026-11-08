import { createFilterStore } from '@rranker/sdk/state/create-filter-store';
import type { ChartType, Difficulty } from '@rranker/game-maimai/domain/models';
import type { VersionNameLocale } from '@rranker/game-maimai/domain/version-names';

export const useCatalogFilter = createFilterStore({
  defaults: {
    keyword: '',
    collapsed: true,
    type: 'all' as ChartType | 'all',
    difficulty: 'all' as Difficulty | 'all',
    constantMin: '',
    constantMax: '',
    version: 'all' as string | 'all',
    genre: 'all',
    versionLocale: 'china' as VersionNameLocale,
    selectedDxRatingTagIds: [] as number[],
  },
  clearKeys: [
    'keyword', 'type', 'difficulty', 'constantMin', 'constantMax', 'version', 'genre',
    'selectedDxRatingTagIds',
  ],
});
