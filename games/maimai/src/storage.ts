import { accountOwnership, type GameStorageDefinition } from '@rranker/sdk/features/storage-management/storage-adapter-core';
import { DXRATING_CHART_TAGS_RESOURCE_KEY } from '@rranker/game-maimai/domain/dxrating-chart-tags';
import { MAIMAI_DXTAG_RESOURCE_PREFIX } from '@rranker/game-maimai/services/maimai-dxtag-cache';
import { isDurableMaimaiAccountId } from './durable-maimai-account';
export const MAIMAI_CATALOG_RESOURCE_KEYS = [
  'detailed-catalog',
  'aliases',
  'plates',
  'collections',
  DXRATING_CHART_TAGS_RESOURCE_KEY,
] as const;

export function storage(): GameStorageDefinition { return {
  gameId: 'maimai',
  title: '舞萌 DX',
  color: '#F43F5E',
  note: '账号成绩快照与当前版本导出素材；SQLite 为估算值',
  queryKeys: [
    ['score-snapshot'], ['game-data'], ['songs'], ['detailed-catalog'], ['plates'],
    ['collections'], ['dxrating-chart-tags'], ['best-image-collections'], ['maimai-dxtag'],
  ],
  fileResources: [],
  ownsDurableAccount: isDurableMaimaiAccountId,
  ownership: {
    ownsAccount: accountOwnership('maimai', isDurableMaimaiAccountId),
    resourceKeys: MAIMAI_CATALOG_RESOURCE_KEYS,
    resourcePrefixes: [MAIMAI_DXTAG_RESOURCE_PREFIX],
  },
}; }
