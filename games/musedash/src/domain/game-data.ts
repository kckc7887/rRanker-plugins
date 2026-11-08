import type { GameDataStatus } from '@rranker/sdk/data-load';
import { type AccountSummary, type GameDataBundle, type PlayerScoreSummary , DataSource } from '@rranker/sdk/data';
import type { MuseDashPlayer } from '@rranker/game-musedash/domain/muse-dash';

export type MuseDashGameDataPayload = {
      kind: 'musedash';
      player: MuseDashPlayer;
      playerScore: PlayerScoreSummary;
      source: DataSource;
    };

export function summarizeData(bundle: GameDataBundle): AccountSummary | null {
  const p = bundle.payload;
  if (p.kind !== 'musedash') return null;
  return { scoreDisplay: p.playerScore.display, displayName: p.player.user.nickname };
}

declare module '@rranker/sdk/data' {
  interface GamePayloads {
    'musedash': MuseDashGameDataPayload;
  }
}

export function getDataStatus(bundle: GameDataBundle): GameDataStatus {
  const payload = bundle.payload;
  if (payload.kind !== 'musedash') return { isStale: false };
  return { isStale: payload.source.isStale,
  };
}
