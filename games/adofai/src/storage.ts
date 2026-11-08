import { accountOwnership, type GameStorageDefinition } from '@rranker/sdk/features/storage-management/storage-adapter-core';

export function storage(): GameStorageDefinition { return {
  gameId: 'adofai',
  title: '冰与火之舞',
  color: '#F15B55',
  note: '玩家资料与核心成绩快照；公开结果仅保留在会话内，SQLite 为估算值',
  queryKeys: [['tuf'], ['game-data']],
  fileResources: [],
  ownership: { ownsAccount: accountOwnership('adofai'), resourcePrefixes: ['tuf:'] },
}; }
