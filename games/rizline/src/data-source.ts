import type { GameDataLoaderContext } from '@rranker/sdk/data-load';
import type { RizlineSnapshot } from './domain/rizline';

export type RizlineDataSource = {
  applyCatalog?: (catalog: import('./domain/rizline').RizlineCatalog, snapshot: RizlineSnapshot) => RizlineSnapshot;
  readCached: () => Promise<RizlineSnapshot | null>;
  readFresh?: (context: Pick<GameDataLoaderContext, 'queryClient' | 'signal'>) => Promise<RizlineSnapshot>;
};
