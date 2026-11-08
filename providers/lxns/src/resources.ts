import { LxnsCatalogProvider } from './providers/lxns-catalog-provider';
import { ChunithmCatalogProvider } from './providers/chunithm-catalog-provider';
import type { DetailedCatalogProvider } from '@rranker/game-maimai/data-source';
import type { ChunithmResources } from '@rranker/game-chunithm/data-source';

const maimai: DetailedCatalogProvider = new LxnsCatalogProvider();
const chunithm: ChunithmResources = new ChunithmCatalogProvider();

export function createResources(gameId: string): DetailedCatalogProvider | ChunithmResources | undefined {
  return gameId === 'maimai' ? maimai : gameId === 'chunithm' ? chunithm : undefined;
}
