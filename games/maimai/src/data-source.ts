import type { AliasSnapshot, CatalogSnapshot, CollectionKind, CollectionSnapshot, PlateSnapshot, Player, ScoreRecord, Song } from './domain/models';

export interface ScoreProvider {
  getPlayer(signal?: AbortSignal): Promise<Player>;
  getRecords(signal?: AbortSignal): Promise<ScoreRecord[]>;
}

export interface CatalogDrivenScoreProvider<TCatalog = CatalogSnapshot> {
  getPlayer(signal?: AbortSignal): Promise<Player>;
  getRecordsFromCatalog(catalog: TCatalog, signal?: AbortSignal): Promise<ScoreRecord[]>;
}

export type AnyScoreProvider = ScoreProvider | CatalogDrivenScoreProvider;

export function isCatalogDrivenScoreProvider<TCatalog = CatalogSnapshot>(
  provider: ScoreProvider | CatalogDrivenScoreProvider<TCatalog>,
): provider is CatalogDrivenScoreProvider<TCatalog> {
  return 'getRecordsFromCatalog' in provider;
}

export interface CatalogProvider {
  getCatalog(signal?: AbortSignal): Promise<CatalogSnapshot>;
}

export type CollectionQuery = {
  kinds?: readonly CollectionKind[];
  required?: boolean;
};

export interface DetailedCatalogProvider extends CatalogProvider {
  getDetailedCatalog(signal?: AbortSignal): Promise<CatalogSnapshot>;
  getSong(songId: string, catalog?: CatalogSnapshot, signal?: AbortSignal): Promise<Song>;
  getAliases(signal?: AbortSignal): Promise<AliasSnapshot>;
  getPlates(signal?: AbortSignal): Promise<PlateSnapshot>;
  getCollections(options?: CollectionQuery, signal?: AbortSignal): Promise<CollectionSnapshot>;
}

export function requireDetailedCatalogProvider(provider: DetailedCatalogProvider | null): DetailedCatalogProvider {
  if (!provider) throw new Error('当前会话不提供详细曲库能力');
  return provider;
}

export type MaimaiDataSource = {
  scoreProvider: AnyScoreProvider;
  catalogProvider: DetailedCatalogProvider;
  persistScores: boolean;
  local?: boolean;
  getOptionalPlayer?: (signal?: AbortSignal) => Promise<Player | null>;
};
