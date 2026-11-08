import { createFilterStore } from '@rranker/sdk/state/create-filter-store';
import { MAJDATA_FILTER_DEFAULTS } from '@rranker/game-majdata-net/domain/majdata';
const spec = { defaults: { ...MAJDATA_FILTER_DEFAULTS, collapsed: true }, clearKeys: ['difficulties', 'tags', 'min', 'max', 'keyword', 'sort'] as const };
export const useMajdataRecordsFilter = createFilterStore(spec);
export const useMajdataCatalogFilter = createFilterStore(spec);
