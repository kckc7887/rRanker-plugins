import { defaultRizlineRandomChartsPreferences, rizlineRandomChartsPreferencesStore } from '@rranker/tool-rizline/features/rizline-random-charts-preferences';
import { createPersistedRandomChartsFilterStore } from '@rranker/sdk/state/create-random-charts-filter-store';

export const useRizlineRandomChartsFilter = createPersistedRandomChartsFilterStore({
  preferences: rizlineRandomChartsPreferencesStore,
  defaults: defaultRizlineRandomChartsPreferences,
  clearKeys: ['difficulty', 'packId', 'constantMin', 'constantMax'],
});
