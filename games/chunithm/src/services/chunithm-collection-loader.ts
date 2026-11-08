import {
  type ChunithmCollectionKind,
  type ChunithmCollectionListSnapshot,
} from '@rranker/game-chunithm/domain/chunithm-collections';
import type { ChunithmResources } from '@rranker/game-chunithm/data-source';
import { resolveGameResources } from '@rranker/sdk/registry';

export function loadChunithmCollections(
  kind: ChunithmCollectionKind,
  signal?: AbortSignal,
): Promise<ChunithmCollectionListSnapshot> {
  const provider = resolveGameResources('chunithm') as ChunithmResources | undefined;
  if (!provider) return Promise.reject(new Error('中二节奏曲库来源不可用'));
  return provider.getCollections(kind, signal);
}
