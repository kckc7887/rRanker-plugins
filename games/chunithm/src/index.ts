import { createElement } from 'react';
import type { GameAdapter } from '@rranker/sdk';
import chunithmIcon from './assets/chunithm.webp';

export const gameIds = ["chunithm"] as const;


export const adapter = {
  refreshResources: async ({ queryClient, signal }) => { await require('./services/chunithm-catalog-query').refreshChunithmCatalog(queryClient, signal); return {}; },
  accountRating: props => { const { AccountRating } = require('./components/ChunithmRatingTag') as typeof import('./components/ChunithmRatingTag'); return createElement(AccountRating, props); },
  storage: gameId => require('./storage').storage(gameId),
  pages: {
    overview: props => { const { OverviewPage } = require('./screens/OverviewPage') as typeof import('./screens/OverviewPage'); return createElement(OverviewPage, props); },
    library: props => { const { LibraryPage } = require('./screens/LibraryPage') as typeof import('./screens/LibraryPage'); return createElement(LibraryPage, props); },
    best: props => { const { ChunithmBestScreen } = require('./screens/BestScreen') as typeof import('./screens/BestScreen'); return createElement(ChunithmBestScreen, props); },
    records: props => { const { ChunithmRecordsScreen } = require('./screens/RecordsScreen') as typeof import('./screens/RecordsScreen'); return createElement(ChunithmRecordsScreen, props); },
    catalog: props => { const { ChunithmSearchScreen } = require('./screens/CatalogScreen') as typeof import('./screens/CatalogScreen'); return createElement(ChunithmSearchScreen, props); },
    detail: props => { const { DetailPage } = require('./screens/DetailPage') as typeof import('./screens/DetailPage'); return createElement(DetailPage, props); },
  },
  parseDetailParams: (gameId, params) => require('./domain/targets').parseDetailParams(gameId, params),
  parseLibraryTarget: value => require('./domain/targets').parseLibraryTarget(value), kind: 'game', id: 'game.chunithm', title: "中二节奏", loadData: context => require('./services/game-data').loadData(context), getDataStatus: bundle => require('./domain/game-data').getDataStatus(bundle), summarizeData: bundle => require('./domain/game-data').summarizeData(bundle), games: [
{ id: 'chunithm', accountOrder: 1, title: '中二节奏', icon: chunithmIcon, profile: { ratingLabel: 'RATING', ratingDigits: 0, bestSections: [] } }
] } satisfies GameAdapter;

export type { ChunithmGameDataPayload } from './domain/game-data';
