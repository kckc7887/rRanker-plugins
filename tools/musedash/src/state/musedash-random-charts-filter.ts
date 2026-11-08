import {
  defaultMuseDashRandomChartsPreferences,
  museDashRandomChartsPreferencesStore,
  type MuseDashRandomChartsPreferences,
} from '@rranker/tool-musedash/features/musedash-random-charts-preferences';
import { createPersistedRandomChartsFilterStore } from '@rranker/sdk/state/create-random-charts-filter-store';

type PreferencesAccess = Pick<
  typeof museDashRandomChartsPreferencesStore,
  'load' | 'save'
>;

export function createMuseDashRandomChartsFilterStore(
  preferences: PreferencesAccess = museDashRandomChartsPreferencesStore,
) {
  return createPersistedRandomChartsFilterStore<MuseDashRandomChartsPreferences>({
    preferences,
    defaults: defaultMuseDashRandomChartsPreferences,
    clearKeys: [
      'difficultySlot', 'dlc', 'constantMin', 'constantMax',
      'accMin', 'accMax', 'achievement',
    ],
  });
}

export const useMuseDashRandomChartsFilter =
  createMuseDashRandomChartsFilterStore();
