import { createFilterStore } from '@rranker/sdk/state/create-filter-store';
import type { MuseDashDifficultySlot, MuseDashDlcFilter } from '@rranker/game-musedash/domain/muse-dash';

export const useMuseDashCatalogFilter = createFilterStore({
  defaults: {
    keyword: '',
    collapsed: true,
    difficultySlot: 'all' as MuseDashDifficultySlot,
    dlc: 'all' as MuseDashDlcFilter,
    constantMin: '',
    constantMax: '',
  },
  clearKeys: ['keyword', 'difficultySlot', 'dlc', 'constantMin', 'constantMax'],
});
