import { createFilterStore } from '@rranker/sdk/state/create-filter-store';
import type { MuseDashAchievementFilter, MuseDashDifficultySlot, MuseDashDlcFilter } from '@rranker/game-musedash/domain/muse-dash';

export const useMuseDashRecordsFilter = createFilterStore({
  defaults: {
    keyword: '',
    collapsed: true,
    difficultySlot: 'all' as MuseDashDifficultySlot,
    dlc: 'all' as MuseDashDlcFilter,
    constantMin: '',
    constantMax: '',
    accMin: '',
    accMax: '',
    achievement: 'all' as MuseDashAchievementFilter,
  },
  clearKeys: ['keyword', 'difficultySlot', 'dlc', 'constantMin', 'constantMax', 'accMin', 'accMax', 'achievement'],
});
