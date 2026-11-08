import {
  chunithmRandomChartsPreferencesStore,
  defaultChunithmRandomChartsPreferences,
  type ChunithmRandomChartsPreferences,
} from '@rranker/tool-chunithm/features/chunithm-random-charts-preferences';
import { createPersistedRandomChartsFilterStore } from '@rranker/sdk/state/create-random-charts-filter-store';

type PreferencesAccess = Pick<
  typeof chunithmRandomChartsPreferencesStore,
  'load' | 'save'
>;

export function createChunithmRandomChartsFilterStore(
  preferences: PreferencesAccess = chunithmRandomChartsPreferencesStore,
) {
  return createPersistedRandomChartsFilterStore<ChunithmRandomChartsPreferences>({
    preferences,
    defaults: defaultChunithmRandomChartsPreferences,
    clearKeys: ['difficulty', 'version', 'constantMin', 'constantMax', 'rankMin', 'rankMax'],
  });
}

export const useChunithmRandomChartsFilter =
  createChunithmRandomChartsFilterStore();
