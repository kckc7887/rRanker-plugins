import { accountOwnership, type GameStorageDefinition } from '@rranker/sdk/features/storage-management/storage-adapter-core';

export function storage(): GameStorageDefinition { return {
  gameId: 'musedash',
  title: '喵斯快跑',
  color: '#EC4899',
  note: '玩家与核心成绩快照；曲库及单曲明细仅保留在会话内，SQLite 为估算值',
  queryKeys: [['musedash'], ['game-data']],
  fileResources: [],
  ownership: { ownsAccount: accountOwnership('musedash'), resourcePrefixes: ['musedash:'] },
}; }
