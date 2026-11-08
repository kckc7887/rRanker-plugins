import type { SnapshotMetadata } from '@rranker/sdk/domain/refresh-result';
import type { SimaiStatistics } from '@rranker/chart-simai/features/simai-chart-preview/statistics';
import type { DataSource, PlayerScoreSummary } from '@rranker/sdk/data';
import type { MajdataSnapshot, MajdataSong, MajdataScore, MajdataRanking } from './domain/majdata';

export type MajdataDataSource = {
  createDemoScore?: (song: MajdataSong, level: number, counts: SimaiStatistics['counts']) => MajdataScore;
  getRanking?: (id: string, signal?: AbortSignal) => Promise<MajdataRanking>;
  readDemoPage?: (page: number, signal: AbortSignal) => Promise<{records: MajdataScore[]; songCount: number}>;
  readCached: () => Promise<MajdataSnapshot | null>;
  readFresh?: (signal: AbortSignal) => Promise<MajdataSnapshot>;
  playerScore?: PlayerScoreSummary;
};

export type MajdataResources = {
  getSongs: (page: number, sort: string, search: string, signal?: AbortSignal) => Promise<MajdataSong[]>;
  loadSong: (id: string, signal?: AbortSignal, onFresh?: (song: MajdataSong) => void, onFallback?: (song: MajdataSong) => void) => Promise<MajdataSong>;
  readSongSnapshot: (id: string) => Promise<{song: MajdataSong; source: DataSource; metadata: SnapshotMetadata} | null>;
  loadChart: (song: MajdataSong, signal?: AbortSignal) => Promise<string>;
  loadParsedChart: (song: MajdataSong, level: number, signal?: AbortSignal) => Promise<{statistics: SimaiStatistics; difficultyScores: readonly [number,number,number,number,number] | null}>;
};
