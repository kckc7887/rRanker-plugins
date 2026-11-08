import { accountOwnership, type GameStorageDefinition } from '@rranker/sdk/features/storage-management/storage-adapter-core';
import { PHIGROS_KYOU_RESOURCE_KEYS } from '@rranker/game-phigros/domain/phigros-kyou';
import { phigrosResources } from '@rranker/game-phigros/services/phigros-resources';
import type { PhigrosResources } from './data-source';
import { resolveGameResources } from '@rranker/sdk/registry';
export const PHIGROS_RESOURCE_KEYS = [
  ...PHIGROS_KYOU_RESOURCE_KEYS,
] as const;

export function storage(): GameStorageDefinition { return {
  gameId: 'phigros',
  title: 'Phigros',
  color: '#8B5CF6',
  note: '账号存档与当前版本导出素材；SQLite 为估算值',
  queryKeys: [['score-snapshot'], ['game-data'], ['phigros-catalog'], ['phigros-kyou-chart-tags']],
  resetMemory: () => { (resolveGameResources('phigros') as PhigrosResources | undefined)?.clearAliasesMemory?.(); phigrosResources.clear(); },
  fileResources: [],
  ownership: { accountResourcePrefixes: ['phigros-save:'], ownsAccount: accountOwnership('phigros'), resourceKeys: PHIGROS_RESOURCE_KEYS },
}; }
