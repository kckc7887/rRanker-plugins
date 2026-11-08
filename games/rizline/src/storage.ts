import { accountOwnership, type GameStorageDefinition } from '@rranker/sdk/features/storage-management/storage-adapter-core';
import { rizlineResources } from '@rranker/game-rizline/services/rizline-resources';
export function storage(): GameStorageDefinition { return {
 gameId: 'rizline', title: 'Rizline', color: '#57E4C4', note: '账号成绩快照与已验证曲库', queryKeys: [['rizline'], ['game-data']], fileResources: [], resetMemory: () => rizlineResources.clear(),
 ownership: { ownsAccount: accountOwnership('rizline'), resourcePrefixes: ['rizline:'] },
}; }
