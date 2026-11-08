import type { GameDataStatus } from '@rranker/sdk/data-load';
import { type AccountSummary, type GameDataBundle, type PlayerScoreSummary, formatPlayerScore , DataSource } from '@rranker/sdk/data';
import { buildLxnsIconUrl } from '@rranker/game-maimai/domain/account-avatar';
import type { GameProfile } from '@rranker/sdk/domain/game-profile';
import type { Player, ScoreRecord, ScoreSnapshot } from '@rranker/game-maimai/domain/models';

export type BestListSection = { id: string; title: string; records: ScoreRecord[] };
export type MaimaiGameDataPayload = {
      kind: 'maimai';
      player: Player;
      records: ScoreRecord[];
      bestSections: BestListSection[];
      playerScore: PlayerScoreSummary;
      currentVersionTitle: string;
      unmatchedRecordCount: number;
      source: DataSource;
      catalogSource: DataSource;
      snapshot: ScoreSnapshot;
    };

export function maimaiPayloadFromSnapshot(snapshot: ScoreSnapshot, profile: GameProfile): MaimaiGameDataPayload {
  return {
    kind: 'maimai',
    player: snapshot.player,
    records: snapshot.records,
    bestSections: [
      { id: 'b35', title: profile.bestSections[0]?.title ?? 'B35', records: snapshot.best50.b35 },
      { id: 'b15', title: profile.bestSections[1]?.title ?? 'B15', records: snapshot.best50.b15 },
    ],
    playerScore: {
      label: profile.ratingLabel,
      value: snapshot.best50.rating,
      display: formatPlayerScore(snapshot.best50.rating, profile.ratingDigits),
    },
    currentVersionTitle: snapshot.best50.currentVersion.title,
    unmatchedRecordCount: snapshot.best50.unmatchedRecordCount,
    source: snapshot.source,
    catalogSource: snapshot.catalogSource,
    snapshot,
  };
}

export function summarizeData(bundle: GameDataBundle): AccountSummary | null {
  const p = bundle.payload;
  if (p.kind !== 'maimai') return null;
  const { providerId, profile } = bundle;
  return { scoreDisplay: formatPlayerScore(p.playerScore.value, profile.ratingDigits),
      displayName: p.player.displayName,
      avatarUrl: providerId === 'lxns' ? buildLxnsIconUrl(p.player.presentation?.iconId) : undefined };
}

declare module '@rranker/sdk/data' {
  interface GamePayloads {
    'maimai': MaimaiGameDataPayload;
  }
}

export function getDataStatus(bundle: GameDataBundle): GameDataStatus {
  const payload = bundle.payload;
  if (payload.kind !== 'maimai') return { isStale: false };
  return { isStale: payload.source.isStale || payload.catalogSource.isStale,
  };
}
