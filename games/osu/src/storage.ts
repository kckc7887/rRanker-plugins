import { accountOwnership, type GameStorageDefinition } from '@rranker/sdk/features/storage-management/storage-adapter-core';
import { getGameDefinition } from '@rranker/sdk/registry';
export function storage(gameId: string): GameStorageDefinition { return {
 gameId, title: getGameDefinition(gameId)!.title, color: '#FF66AA', note: '玩家资料、Top 100 与已知成绩快照；SQLite 为估算值',
 queryKeys: [['score-snapshot'], ['game-data'], ['osu-catalog-search'], ['osu-beatmapset-detail'], ['osu-known-scores'], ['osu-beatmapset-user-scores'], ['osu-demo-scores']], fileResources: [],
 ownership: { ownsAccount: accountOwnership(gameId), resourcePrefixes: [`osu:${gameId}:`, `osu-known-scores:${gameId}:`] },
}; }
