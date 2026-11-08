import type { CacheResource } from '@rranker/sdk/features/storage-management/storage-adapter-core';
import { BEST_IMAGE_STAGE_ROOT } from '@rranker/sdk/features/storage-management/fs-storage';
import { clearUnusedBestImageAssets } from '@rranker/sdk/features/best-image/load-best-image-session';
import { CHUNITHM_ASSETS_ROOT } from './paths';
import { clearChunithmUiCache, CHUNITHM_UI_CACHE_VERSION } from './features/chunithm-best-image/chunithm-ui-cache';
export function cache(gameId: string): readonly CacheResource[] { return [
{ root: CHUNITHM_ASSETS_ROOT, clear: clearChunithmUiCache, currentVersions: [CHUNITHM_UI_CACHE_VERSION] },
{ root: () => BEST_IMAGE_STAGE_ROOT(gameId), clear: () => clearUnusedBestImageAssets(gameId) },
]; }
