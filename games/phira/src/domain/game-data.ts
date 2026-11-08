import type { GameDataStatus } from '@rranker/sdk/data-load';
import { type AccountSummary, type GameDataBundle, type PlayerScoreSummary , DataSource } from '@rranker/sdk/data';
import type { PhiraBestSnapshot, PhiraPlayerSnapshot } from '@rranker/game-phira/domain/phira';

export type PhiraGameDataPayload = {
      kind: 'phira';
      snapshot: PhiraPlayerSnapshot;
      bests: PhiraBestSnapshot | null;
      playerScore: PlayerScoreSummary;
      source: DataSource;
    };

export function summarizeData(bundle: GameDataBundle): AccountSummary | null {
  const p = bundle.payload;
  if (p.kind !== 'phira') return null;
  return { scoreDisplay: p.playerScore.display, displayName: p.snapshot.player.name, avatarUrl: p.snapshot.player.avatar ?? undefined };
}

declare module '@rranker/sdk/data' {
  interface GamePayloads {
    'phira': PhiraGameDataPayload;
  }
}

export function getDataStatus(bundle: GameDataBundle): GameDataStatus {
  const payload = bundle.payload;
  if (payload.kind !== 'phira') return { isStale: false };
  return { isStale: payload.source.isStale,
  };
}
