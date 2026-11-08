import type { CacheResource } from '@rranker/sdk/features/storage-management/storage-adapter-core';
import { BEST_IMAGE_STAGE_ROOT } from '@rranker/sdk/features/storage-management/fs-storage';
import { clearUnusedBestImageAssets } from '@rranker/sdk/features/best-image/load-best-image-session';
import { MAIMAI_ASSETS_ROOT } from './paths';
import { clearMaimaiUiCache, MAIMAI_UI_CACHE_VERSION } from './features/best-image/maimai-ui-cache';
import { MAIMAI_FONT_CACHE_VERSION } from './features/best-image/maimai-font-cache';
export function cache(gameId: string): readonly CacheResource[] { return [
{ root: MAIMAI_ASSETS_ROOT, clear: clearMaimaiUiCache, currentVersions: [MAIMAI_UI_CACHE_VERSION, MAIMAI_FONT_CACHE_VERSION] },
{ root: () => BEST_IMAGE_STAGE_ROOT(gameId), clear: () => clearUnusedBestImageAssets(gameId) },
]; }
