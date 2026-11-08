import type { GameDataStatus } from '@rranker/sdk/data-load';
import { type AccountSummary, type GameDataBundle, type PlayerScoreSummary , DataSource } from '@rranker/sdk/data';
import { resolveTufAvatarUrl } from '@rranker/game-adofai/domain/tuf';
import type { TufPlayer } from '@rranker/game-adofai/domain/tuf';

export type AdofaiGameDataPayload = {
      kind: 'adofai';
      player: TufPlayer;
      playerScore: PlayerScoreSummary;
      source: DataSource;
    };

export function summarizeData(bundle: GameDataBundle): AccountSummary | null {
  const p = bundle.payload;
  if (p.kind !== 'adofai') return null;
  return { scoreDisplay: p.playerScore.display, displayName: p.player.name, avatarUrl: resolveTufAvatarUrl(p.player) ?? undefined };
}

declare module '@rranker/sdk/data' {
  interface GamePayloads {
    'adofai': AdofaiGameDataPayload;
  }
}

export function getDataStatus(bundle: GameDataBundle): GameDataStatus {
  const payload = bundle.payload;
  if (payload.kind !== 'adofai') return { isStale: false };
  return { isStale: payload.source.isStale,
  };
}
