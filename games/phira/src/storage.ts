import { accountOwnership, type GameStorageDefinition } from '@rranker/sdk/features/storage-management/storage-adapter-core';

export function storage(): GameStorageDefinition { return {
  gameId: 'phira',
  title: 'Phira',
  color: '#8D5BD6',
  note: '玩家与核心成绩快照；曲库、谱面及物量仅保留在会话内，SQLite 为估算值',
  queryKeys: [['phira'], ['game-data']],
  fileResources: [],
  ownership: { ownsAccount: accountOwnership('phira'), resourcePrefixes: ['phira:'] },
}; }
