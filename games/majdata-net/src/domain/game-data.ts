import type { GameDataStatus } from '@rranker/sdk/data-load';
import { type AccountSummary, type GameDataBundle, type PlayerScoreSummary , DataSource } from '@rranker/sdk/data';
import { majdataAvatarUrl } from '@rranker/game-majdata-net/domain/majdata';

export type MajdataGameDataPayload = { kind: 'majdata-net'; snapshot: import('./majdata').MajdataSnapshot; playerScore: PlayerScoreSummary; source: DataSource };

export function summarizeData(bundle: GameDataBundle): AccountSummary | null {
  const p = bundle.payload;
  if (p.kind !== 'majdata-net') return null;
  const { providerId } = bundle;
  return { scoreDisplay: p.playerScore.display, displayName: p.snapshot.player.username,
      avatarUrl: providerId === 'majdata-net' ? majdataAvatarUrl(p.snapshot.player.username) : undefined,
      storedDisplayName: providerId === 'majdata-net' ? p.snapshot.player.username : undefined };
}

declare module '@rranker/sdk/data' {
  interface GamePayloads {
    'majdata-net': MajdataGameDataPayload;
  }
}

export function getDataStatus(bundle: GameDataBundle): GameDataStatus {
  const payload = bundle.payload;
  if (payload.kind !== 'majdata-net') return { isStale: false };
  return { isStale: payload.source.isStale,
  };
}
