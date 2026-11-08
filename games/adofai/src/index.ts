import { createElement } from 'react';
import type { GameAdapter } from '@rranker/sdk';
import adofaiIcon from './assets/adofai.webp';

export const gameIds = ["adofai"] as const;


export const adapter = {
  refreshResources: async ({ queryClient }) => { await require('./services/game-data').invalidateTufDifficulties(queryClient); return {}; },
  accountRating: props => { const { AccountRating } = require('./components/TufOverviewDetails') as typeof import('./components/TufOverviewDetails'); return createElement(AccountRating, props); },
  storage: gameId => require('./storage').storage(gameId),
  pages: {
    overview: props => { const { OverviewPage } = require('./screens/OverviewPage') as typeof import('./screens/OverviewPage'); return createElement(OverviewPage, props); },
    library: props => { const { LibraryPage } = require('./screens/LibraryPage') as typeof import('./screens/LibraryPage'); return createElement(LibraryPage, props); },
    best: props => { const { TufBestScreen } = require('./screens/TufScreens') as typeof import('./screens/TufScreens'); return createElement(TufBestScreen, props); },
    records: props => { const { TufRecordsScreen } = require('./screens/TufScreens') as typeof import('./screens/TufScreens'); return createElement(TufRecordsScreen, props); },
    catalog: props => { const { TufSearchScreen } = require('./screens/TufScreens') as typeof import('./screens/TufScreens'); return createElement(TufSearchScreen, props); },
    detail: props => { const { DetailPage } = require('./screens/DetailPage') as typeof import('./screens/DetailPage'); return createElement(DetailPage, props); },
  },
  parseDetailParams: (gameId, params) => require('./domain/targets').parseDetailParams(gameId, params),
  parseLibraryTarget: value => require('./domain/targets').parseLibraryTarget(value), kind: 'game', id: 'game.adofai', title: "冰与火之舞", loadData: context => require('./services/game-data').loadData(context), getDataStatus: bundle => require('./domain/game-data').getDataStatus(bundle), summarizeData: bundle => require('./domain/game-data').summarizeData(bundle), games: [
{ id: 'adofai', accountOrder: 4, title: '冰与火之舞', icon: adofaiIcon, profile: { ratingLabel: 'RANKED SCORE', ratingDigits: 0, bestSections: [{ id: 'top20', title: 'Top 20 Impact', size: 20 }] } }
] } satisfies GameAdapter;

export type { AdofaiGameDataPayload } from './domain/game-data';
