import type { GameDataStatus } from '@rranker/sdk/data-load';
import { type AccountSummary, type GameDataBundle, type PlayerScoreSummary , DataSource } from '@rranker/sdk/data';
import { buildChunithmMapIconUrl } from '@rranker/game-chunithm/domain/chunithm-personal';
import type { ChunithmPlayer, ChunithmScore } from '@rranker/game-chunithm/domain/chunithm-personal';

export type ChunithmBestListSection = {
  id: 'b30' | 'new20';
  title: 'Best 30' | 'New 20';
  scores: ChunithmScore[];
};
export type ChunithmGameDataPayload = {
      kind: 'chunithm';
      player: ChunithmPlayer | null;
      scores: ChunithmScore[];
      bestSections: ChunithmBestListSection[];
      /** Selection 10 只追加到成绩图，不进入最佳列表。 */
      selections: ChunithmScore[];
      playerScore: PlayerScoreSummary;
      source: DataSource;
      hasSyncedData: boolean;
    };

export function summarizeData(bundle: GameDataBundle): AccountSummary | null {
  const p = bundle.payload;
  if (p.kind !== 'chunithm') return null;
  const { providerId } = bundle;
  return { scoreDisplay: p.playerScore.display, displayName: p.player?.name,
      avatarUrl: buildChunithmMapIconUrl(p.player?.map_icon?.id) ?? undefined,
      displayData: { ratingPossession: p.player?.rating_possession ?? null },
      storedDisplayName: providerId === 'lxns' ? p.player?.name ?? '落雪账号（待同步）' : undefined };
}

declare module '@rranker/sdk/data' {
  interface GamePayloads {
    'chunithm': ChunithmGameDataPayload;
  }
}

export function getDataStatus(bundle: GameDataBundle): GameDataStatus {
  const payload = bundle.payload;
  if (payload.kind !== 'chunithm') return { isStale: false };
  return { isStale: payload.source.isStale,
    ...(!payload.hasSyncedData ? { failure: { code: 'no_data', target: 'data', diagnostic: '账号还没有可同步的成绩', retryable: true } as const } : {}),
  };
}
