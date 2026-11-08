import type { GameDataStatus } from '@rranker/sdk/data-load';
import { type AccountSummary, type GameDataBundle, type PlayerScoreSummary , DataSource } from '@rranker/sdk/data';
import type { GameProfile } from '@rranker/sdk/domain/game-profile';
import { formatOsuPp, type OsuBestScore, type OsuPlayer, type OsuSnapshot } from '@rranker/game-osu/domain/osu';

export type OsuGameDataPayload = {
      kind: 'osu';
      player: OsuPlayer;
      bestScores: OsuBestScore[];
      playerScore: PlayerScoreSummary;
      source: DataSource;
    };

export function osuPayloadFromSnapshot(
  snapshot: OsuSnapshot,
  profile: GameProfile,
): OsuGameDataPayload {
  return {
    kind: 'osu',
    player: snapshot.data.player,
    bestScores: snapshot.data.bestScores,
    playerScore: {
      label: profile.ratingLabel,
      value: snapshot.data.player.pp,
      display: formatOsuPp(snapshot.data.player.pp),
    },
    source: snapshot.source,
  };
}

export function summarizeData(bundle: GameDataBundle): AccountSummary | null {
  const p = bundle.payload;
  if (p.kind !== 'osu') return null;
  return { scoreDisplay: p.playerScore.display, displayName: p.player.username, avatarUrl: p.player.avatarUrl ?? undefined };
}

declare module '@rranker/sdk/data' {
  interface GamePayloads {
    'osu-standard': OsuGameDataPayload;
    'osu-mania': OsuGameDataPayload;
    'osu-catch': OsuGameDataPayload;
    'osu-taiko': OsuGameDataPayload;
  }
}

export function getDataStatus(bundle: GameDataBundle): GameDataStatus {
  const payload = bundle.payload;
  if (payload.kind !== 'osu') return { isStale: false };
  return { isStale: payload.source.isStale,
  };
}
