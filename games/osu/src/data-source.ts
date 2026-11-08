import type { OsuBeatmapDetail, OsuBeatmapsetDetail, OsuBeatmapsetSearchParams, OsuBestScore, OsuCatalogSong, OsuSnapshot, OsuKnownScoresSnapshot } from './domain/osu';

export type OsuCatalogPage = { songs: OsuCatalogSong[]; total?: number; recommendedDifficulty: number | null; cursor: string | null };
export type OsuDemoPage = { scores: OsuBestScore[]; nextPage: number | undefined };
export type OsuDataSource = {
  readCached: () => Promise<OsuSnapshot | null>;
  readFresh: (signal: AbortSignal) => Promise<OsuSnapshot>;
  persist?: (snapshot: OsuSnapshot, assertCurrent: () => void) => Promise<void>;
  searchCatalog: (params: OsuBeatmapsetSearchParams, cursor: string | undefined, signal: AbortSignal) => Promise<OsuCatalogPage>;
  getBeatmapset: (id: string, signal: AbortSignal) => Promise<OsuBeatmapsetDetail>;
  userId?: number;
  readKnownScores?: () => Promise<OsuKnownScoresSnapshot | null>;
  mergeKnownScores?: (scores: readonly OsuBestScore[], assertCurrent: () => void) => Promise<OsuKnownScoresSnapshot>;
  createDemoScores?: (song: OsuBeatmapsetDetail) => OsuBestScore[];
  getBeatmapScore?: (song: OsuBeatmapsetDetail, beatmap: OsuBeatmapDetail, signal: AbortSignal) => Promise<OsuBestScore | null>;
  readDemoPage?: (page: number, signal: AbortSignal) => Promise<OsuDemoPage>;
};
