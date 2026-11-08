import type { QueryClient } from '@tanstack/react-query';
import type { PlayerScoreSummary } from '@rranker/sdk/data';
import type { TufPlayerSnapshot, TufLevel, TufPass, TufPlayerSearchResponse, TufPassQuery, TufPassPage, TufLevelQuery, TufLevelPage, TufLevelDetailResponse, TufLevelPass, TufVideoDetails, TufDifficulty } from './domain/tuf';

export type AdofaiDataSource = {
  createDemoPass?: (level: TufLevel) => TufPass | null;
  playerScore?: PlayerScoreSummary;
  entityKey: readonly unknown[];
  readCached: () => Promise<TufPlayerSnapshot | null>;
  readFresh: (signal: AbortSignal) => Promise<TufPlayerSnapshot>;
  persist?: (snapshot: TufPlayerSnapshot, assertCurrent: () => void) => Promise<void>;
};

export type TufResources = {
  loadPlayer: (queryClient: QueryClient, playerId: number, signal: AbortSignal) => Promise<TufPlayerSnapshot>;
  searchPlayers: (query: string, limit: number, offset: number, signal?: AbortSignal) => Promise<TufPlayerSearchResponse>;
  getPasses: (playerId: number, query: TufPassQuery, signal?: AbortSignal) => Promise<TufPassPage>;
  searchLevels: (query: TufLevelQuery, signal?: AbortSignal) => Promise<TufLevelPage>;
  getLevel: (id: number, signal?: AbortSignal) => Promise<TufLevelDetailResponse>;
  getLevelPasses: (id: number, signal?: AbortSignal) => Promise<TufLevelPass[]>;
  getVideoDetails: (url: string, signal?: AbortSignal) => Promise<TufVideoDetails>;
  getDifficulties: (signal?: AbortSignal) => Promise<TufDifficulty[]>;
};
