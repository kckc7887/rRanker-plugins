import { PhigrosKyouProvider } from './providers/phigros-kyou-provider';
import { loadPhigrosKyouAliases, resetPhigrosKyouAliasesCache } from './services/phigros-kyou-cache';
import { PhigrosCatalogProvider } from './providers/phigros-catalog-provider';
import type { PhigrosResources } from '@rranker/game-phigros/data-source';

const tags = new PhigrosKyouProvider();
const provider: PhigrosResources = Object.assign(new PhigrosCatalogProvider(), {
 loadAliases: loadPhigrosKyouAliases, clearAliasesMemory: resetPhigrosKyouAliasesCache,
 getChartTags: (signal?: AbortSignal) => tags.getChartTags(signal),
});
export function createResources(): PhigrosResources { return provider; }
