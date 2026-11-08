import {
  type ChunithmAliasSnapshot,
  type ChunithmCatalogSnapshot,
} from '@rranker/game-chunithm/domain/chunithm';
import type { ChunithmResources } from '@rranker/game-chunithm/data-source';
import { resolveGameResources } from '@rranker/sdk/registry';

export const CHUNITHM_CATALOG_SCHEMA_VERSION = 2;
export const CHUNITHM_ALIAS_SCHEMA_VERSION = 1;
export const CHUNITHM_CATALOG_QUERY_KEY = [
  'chunithm-catalog',
  CHUNITHM_CATALOG_SCHEMA_VERSION,
] as const;

function resources(): ChunithmResources {
  const value = resolveGameResources('chunithm') as ChunithmResources | undefined;
  if (!value) throw new Error('CHUNITHM 曲库来源不可用');
  return value;
}

export function loadChunithmCatalog(signal?: AbortSignal): Promise<ChunithmCatalogSnapshot> {
  return resources().getCatalog(signal);
}

export function loadChunithmNewVersionTitles(signal?: AbortSignal): Promise<string[]> {
  return resources().getNewVersionTitles(signal);
}

export function loadChunithmAliases(signal?: AbortSignal): Promise<ChunithmAliasSnapshot> {
  return resources().getAliases(signal);
}
