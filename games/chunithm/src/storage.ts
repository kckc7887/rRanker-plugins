import { accountOwnership, type GameStorageDefinition } from '@rranker/sdk/features/storage-management/storage-adapter-core';
import { CHUNITHM_ALIAS_RESOURCE_KEY, CHUNITHM_CATALOG_RESOURCE_KEY, CHUNITHM_SONG_DETAIL_RESOURCE_PREFIX } from '@rranker/game-chunithm/domain/chunithm';
import { CHUNITHM_COLLECTION_LIST_RESOURCE_KEY } from '@rranker/game-chunithm/domain/chunithm-collections';
export const CHUNITHM_CATALOG_RESOURCE_KEYS = [
  CHUNITHM_CATALOG_RESOURCE_KEY,
  CHUNITHM_ALIAS_RESOURCE_KEY,
] as const;

export function storage(): GameStorageDefinition { return {
  gameId: 'chunithm',
  title: '中二节奏',
  color: '#27A7E7',
  note: '账号成绩快照；公开曲库仅保留在会话内，SQLite 为估算值',
  queryKeys: [['score-snapshot'], ['game-data'], ['chunithm-catalog'], ['chunithm-song-detail'], ['chunithm-collections']],
  fileResources: [],
  ownership: { accountResourcePrefixes: ['chunithm-score:'], ownsAccount: accountOwnership('chunithm'), resourceKeys: CHUNITHM_CATALOG_RESOURCE_KEYS, resourcePrefixes: [CHUNITHM_SONG_DETAIL_RESOURCE_PREFIX, `${CHUNITHM_COLLECTION_LIST_RESOURCE_KEY}:`] },
}; }
