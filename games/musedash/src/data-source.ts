import type { GameDataLoaderContext } from '@rranker/sdk/data-load';
import type { MuseDashPlayerSnapshot, MuseDashAlbumsSnapshot, MuseDashCeSnapshot, MuseDashDiffdiffSnapshot, MuseDashPlayDetailSnapshot, MuseDashPlayer, MuseDashPlayDetail, MuseDashAlbumsResponse, MuseDashCeResponse, MuseDashDiffdiffEntry } from './domain/muse-dash';

export type MuseDashDataSource = {
  getPlayDetail: (uid: string, difficulty: number, platform: string, signal?: AbortSignal) => Promise<MuseDashPlayDetailSnapshot>;
  entityKey: readonly unknown[];
  readCached: () => Promise<MuseDashPlayerSnapshot | null>;
  readFresh: (context: Pick<GameDataLoaderContext, 'queryClient' | 'signal'>) => Promise<MuseDashPlayerSnapshot>;
  persist?: (snapshot: MuseDashPlayerSnapshot, assertCurrent: () => void) => Promise<void>;
};

export type MuseDashResources = {
  loadPlayer: (queryClient: import('@tanstack/react-query').QueryClient, userId: string, signal: AbortSignal) => Promise<MuseDashPlayerSnapshot>;
  loadAlbums: (signal: AbortSignal) => Promise<MuseDashAlbumsSnapshot>;
  loadCe: (signal: AbortSignal) => Promise<MuseDashCeSnapshot>;
  loadDiffdiff: (signal: AbortSignal) => Promise<MuseDashDiffdiffSnapshot>;
  refresh: (queryClient: import('@tanstack/react-query').QueryClient) => Promise<void>;
  searchPlayers: (query: string, signal?: AbortSignal) => Promise<[string, string][]>;
  getPlayer: (userId: string, signal?: AbortSignal) => Promise<MuseDashPlayer>;
  getPlayDetail: (uid: string, difficulty: number, platform: string, userId: string, signal?: AbortSignal) => Promise<MuseDashPlayDetail>;
  getAlbums: (signal?: AbortSignal) => Promise<MuseDashAlbumsResponse>;
  getCe: (signal?: AbortSignal) => Promise<MuseDashCeResponse>;
  getDiffdiff: (signal?: AbortSignal) => Promise<MuseDashDiffdiffEntry[]>;
};
