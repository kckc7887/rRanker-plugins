import type { CacheResource } from '@rranker/sdk/features/storage-management/storage-adapter-core';
import { BEST_IMAGE_STAGE_ROOT } from '@rranker/sdk/features/storage-management/fs-storage';
import { clearUnusedBestImageAssets } from '@rranker/sdk/features/best-image/load-best-image-session';
import { RIZLINE_UI_ROOT } from './paths';
import { clearRizlineUiCache, RIZLINE_UI_CACHE_VERSION } from './features/rizline-best-image/rizline-ui-cache';
export function cache(gameId: string): readonly CacheResource[] { return [
{ root: RIZLINE_UI_ROOT, clear: clearRizlineUiCache, currentVersions: [RIZLINE_UI_CACHE_VERSION] },
{ root: () => BEST_IMAGE_STAGE_ROOT(gameId), clear: () => clearUnusedBestImageAssets(gameId) },
]; }
