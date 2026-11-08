import { defaultRizlineFilters } from '@rranker/game-rizline/domain/rizline-filters';
import { createFilterStore } from '@rranker/sdk/state/create-filter-store';

export const useRizlineCatalogFilter = createFilterStore({
  defaults: { ...defaultRizlineFilters(), keyword: '', collapsed: true },
  clearKeys: ['keyword', 'difficulty', 'packId', 'constantMin', 'constantMax'],
});
