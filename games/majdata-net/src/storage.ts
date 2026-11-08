import { accountOwnership, type GameStorageDefinition } from '@rranker/sdk/features/storage-management/storage-adapter-core';

export function storage(): GameStorageDefinition { return {
  gameId: 'majdata-net', title: 'Majdata Net', color: '#2563EB', note: '玩家成绩、歌曲和谱面缓存',
  queryKeys: [['majdata-net'], ['game-data']], fileResources: [],
  ownership: { ownsAccount: accountOwnership('majdata-net'), resourcePrefixes: ['majdata-net:'] },
}; }
