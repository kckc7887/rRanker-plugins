import {
  defaultRandomChartsPreferences,
  randomChartsPreferencesStore,
  type RandomChartsPreferences,
} from '@rranker/tool-maimai/features/random-charts-preferences';
import { createPersistedRandomChartsFilterStore } from '@rranker/sdk/state/create-random-charts-filter-store';

type PreferencesAccess = Pick<typeof randomChartsPreferencesStore, 'load' | 'save'>;

export function createRandomChartsFilterStore(
  preferences: PreferencesAccess = randomChartsPreferencesStore,
) {
  return createPersistedRandomChartsFilterStore<RandomChartsPreferences>({
    preferences,
    defaults: defaultRandomChartsPreferences,
    clearKeys: [
      'difficulty', 'version', 'genre', 'type', 'constantMin', 'constantMax',
      'achievementMin', 'achievementMax', 'soloAchievement', 'multiAchievement',
      'selectedDxRatingTagIds',
    ],
  });
}

export const useRandomChartsFilter = createRandomChartsFilterStore();
