import type { CacheResource } from '@rranker/sdk/features/storage-management/storage-adapter-core';
import { BEST_IMAGE_STAGE_ROOT } from '@rranker/sdk/features/storage-management/fs-storage';
import { clearUnusedBestImageAssets } from '@rranker/sdk/features/best-image/load-best-image-session';
import { PHIGROS_FONT_ROOT, PHIGROS_UI_ROOT } from './paths';
import { clearPhigrosFontCache, PHIGROS_FONT_CACHE_VERSION } from './features/phigros-best-image/phigros-font-cache';
import { clearPhigrosUiCache, PHIGROS_UI_CACHE_VERSION } from './features/phigros-best-image/phigros-ui-cache';
export function cache(gameId: string): readonly CacheResource[] { return [
{ root: PHIGROS_FONT_ROOT, clear: clearPhigrosFontCache, currentVersions: [PHIGROS_FONT_CACHE_VERSION] },
{ root: PHIGROS_UI_ROOT, clear: clearPhigrosUiCache, currentVersions: [PHIGROS_UI_CACHE_VERSION] },
{ root: () => BEST_IMAGE_STAGE_ROOT(gameId), clear: () => clearUnusedBestImageAssets(gameId) },
]; }
