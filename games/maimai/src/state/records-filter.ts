import { createFilterStore } from '@rranker/sdk/state/create-filter-store';
import type { MaimaiFcAchievement, MaimaiFsAchievement } from '@rranker/game-maimai/domain/maimai-filters';
import type { ChartType, Difficulty } from '@rranker/game-maimai/domain/models';
import type { VersionNameLocale } from '@rranker/game-maimai/domain/version-names';

export const useRecordsFilter = createFilterStore({
  defaults: {
    keyword: '',
    collapsed: true,
    difficulty: 'all' as Difficulty | 'all',
    version: 'all' as string | 'all',
    genre: 'all',
    type: 'all' as ChartType | 'all',
    constantMin: '',
    constantMax: '',
    achievementMin: '',
    achievementMax: '',
    soloAchievement: null as MaimaiFcAchievement | null,
    multiAchievement: null as MaimaiFsAchievement | null,
    selectedDxRatingTagIds: [] as number[],
    sortBy: 'rating' as 'rating' | 'achievements' | 'title',
    versionLocale: 'china' as VersionNameLocale,
  },
  clearKeys: [
    'keyword', 'difficulty', 'version', 'genre', 'type',
    'constantMin', 'constantMax', 'achievementMin', 'achievementMax',
    'soloAchievement', 'multiAchievement', 'selectedDxRatingTagIds',
  ],
});
