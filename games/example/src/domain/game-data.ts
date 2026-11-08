import type { GameDataStatus } from '@rranker/sdk/data-load';
import { type AccountSummary, type GameDataBundle, type PlayerScoreSummary , DataSource } from '@rranker/sdk/data';
import type { ExampleRecord } from '@rranker/game-example/domain/example';

export type ExampleGameDataPayload = { kind: 'example'; displayName: string; records: ExampleRecord[];
      bestSections: { id: string; title: string; data: ExampleRecord[] }[];
      playerScore: PlayerScoreSummary; source: DataSource };

export function summarizeData(bundle: GameDataBundle): AccountSummary | null {
  const p = bundle.payload;
  if (p.kind !== 'example') return null;
  return { scoreDisplay: p.playerScore.display, displayName: p.displayName };
}

declare module '@rranker/sdk/data' {
  interface GamePayloads {
    'example': ExampleGameDataPayload;
  }
}

export function getDataStatus(bundle: GameDataBundle): GameDataStatus {
  const payload = bundle.payload;
  if (payload.kind !== 'example') return { isStale: false };
  return { isStale: payload.source.isStale,
  };
}
