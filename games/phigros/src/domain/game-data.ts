import type { GameDataStatus } from '@rranker/sdk/data-load';
import { type AccountSummary, type GameDataBundle, type PlayerScoreSummary , DataSource } from '@rranker/sdk/data';
import type { Player, ScoreRecord } from '@rranker/game-phigros/domain/models';

export type BestListSection = { id: string; title: string; records: ScoreRecord[] };
export type PhigrosGameDataPayload = {
      kind: 'phigros';
      resourceRevision?: string;
      player: Player;
      records: ScoreRecord[];
      bestSections: BestListSection[];
      playerScore: PlayerScoreSummary;
      challengeModeRank: number;
      source: DataSource;
      saveUpdatedAt: string;
      catalogSource: DataSource;
      avatarUrl?: string | null;
      avatarKey?: string | null;
      backgroundSongId?: string | null;
      dataAmount: string;
      progress: {
        cleared: [number, number, number, number];
        fullCombo: [number, number, number, number];
        phi: [number, number, number, number];
      };
    };

export function phigrosPayloadFromSnapshot(
  snapshot: Pick<PhigrosGameDataPayload, 'player' | 'records' | 'bestSections' | 'challengeModeRank' | 'source' | 'progress'>,
  catalogSource: DataSource,
  details: Partial<Pick<PhigrosGameDataPayload, 'resourceRevision' | 'avatarUrl' | 'avatarKey' | 'backgroundSongId' | 'dataAmount'>> = {},
): PhigrosGameDataPayload {
  return {
    kind: 'phigros',
    player: snapshot.player,
    records: snapshot.records,
    bestSections: snapshot.bestSections,
    playerScore: { label: 'Raking Score', value: snapshot.player.rating, display: snapshot.player.rating.toFixed(4) },
    challengeModeRank: snapshot.challengeModeRank,
    source: snapshot.source,
    saveUpdatedAt: snapshot.source.updatedAt,
    catalogSource,
    avatarUrl: null,
    avatarKey: null,
    backgroundSongId: null,
    dataAmount: '0KiB',
    progress: snapshot.progress,
    ...details,
  };
}

export function summarizeData(bundle: GameDataBundle): AccountSummary | null {
  const p = bundle.payload;
  if (p.kind !== 'phigros') return null;
  const { providerId } = bundle;
  return { scoreDisplay: p.playerScore.display, displayName: p.player.displayName,
      avatarUrl: p.avatarUrl ?? undefined, displayData: { challengeModeRank: p.challengeModeRank },
      storedDisplayName: providerId === 'phi-taptap' ? p.player.displayName : undefined };
}

declare module '@rranker/sdk/data' {
  interface GamePayloads {
    'phigros': PhigrosGameDataPayload;
  }
}

export function getDataStatus(bundle: GameDataBundle): GameDataStatus {
  const payload = bundle.payload;
  if (payload.kind !== 'phigros') return { isStale: false };
  return { isStale: payload.source.isStale || payload.catalogSource.isStale,
  };
}
