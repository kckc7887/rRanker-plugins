import { createElement } from 'react';
import type { GameAdapter } from '@rranker/sdk';
import phigrosIcon from './assets/phigros.webp';

export const gameIds = ["phigros"] as const;


export const adapter = {
  capabilities: ['chart.phigros'],
  refreshResources: async ({ queryClient, signal }) => { await require('./services/phigros-catalog-query').refreshPhigrosCatalog(queryClient, signal); return {}; },
  accountRating: props => { const { AccountRating } = require('./components/PhigrosAccountTags') as typeof import('./components/PhigrosAccountTags'); return createElement(AccountRating, props); },
  storage: gameId => require('./storage').storage(gameId),
  pages: {
    overview: props => { const { OverviewPage } = require('./screens/OverviewPage') as typeof import('./screens/OverviewPage'); return createElement(OverviewPage, props); },
    library: props => { const { LibraryPage } = require('./screens/LibraryPage') as typeof import('./screens/LibraryPage'); return createElement(LibraryPage, props); },
    best: props => { const { PhigrosBestScreen } = require('./screens/BestScreen') as typeof import('./screens/BestScreen'); return createElement(PhigrosBestScreen, props); },
    records: props => { const { PhigrosRecordsScreen } = require('./screens/RecordsScreen') as typeof import('./screens/RecordsScreen'); return createElement(PhigrosRecordsScreen, props); },
    catalog: props => { const { PhigrosSearchScreen } = require('./screens/CatalogScreen') as typeof import('./screens/CatalogScreen'); return createElement(PhigrosSearchScreen, props); },
    detail: props => { const { DetailPage } = require('./screens/DetailPage') as typeof import('./screens/DetailPage'); return createElement(DetailPage, props); },
  },
  parseDetailParams: (gameId, params) => require('./domain/targets').parseDetailParams(gameId, params),
  parseLibraryTarget: value => require('./domain/targets').parseLibraryTarget(value), kind: 'game', id: 'game.phigros', title: "Phigros", loadData: context => require('./services/game-data').loadData(context), getDataStatus: bundle => require('./domain/game-data').getDataStatus(bundle), summarizeData: bundle => require('./domain/game-data').summarizeData(bundle), games: [
{ id: 'phigros', accountOrder: 2, title: 'Phigros', icon: phigrosIcon, profile: { ratingLabel: 'RKS', ratingDigits: 4, bestSections: [
      { id: 'phi3', title: 'Phi3', size: 3 },
      { id: 'b27', title: 'Best27', size: 27 },
    ] } }
] } satisfies GameAdapter;

export type { PhigrosGameDataPayload } from './domain/game-data';
