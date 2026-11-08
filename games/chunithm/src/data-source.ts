import type { GameDataLoaderContext } from '@rranker/sdk/data-load';
import type { RefreshResult } from '@rranker/sdk/domain/refresh-result';
import type { ChunithmPersonalSnapshot, ChunithmPlayer } from './domain/chunithm-personal';

export type ChunithmDataSource = {
  readCached: () => Promise<ChunithmPersonalSnapshot | null>;
  readFresh: (context: Pick<GameDataLoaderContext, 'queryClient' | 'signal'>) => Promise<RefreshResult<ChunithmPersonalSnapshot, 'player' | 'scores' | 'bests'>>;
  getPlayer?: (signal?: AbortSignal) => Promise<ChunithmPlayer | null>;
};

export type ChunithmResources = {
  getCatalog: (signal?: AbortSignal) => Promise<import('./domain/chunithm').ChunithmCatalogSnapshot>;
  getAliases: (signal?: AbortSignal) => Promise<import('./domain/chunithm').ChunithmAliasSnapshot>;
  getNewVersionTitles: (signal?: AbortSignal) => Promise<string[]>;
  getSongDetail: (songId: string | number, signal?: AbortSignal) => Promise<import('./domain/chunithm').ChunithmSongDetailSnapshot>;
  getCollections: (kind: import('./domain/chunithm-collections').ChunithmCollectionKind, signal?: AbortSignal) => Promise<import('./domain/chunithm-collections').ChunithmCollectionListSnapshot>;
};
