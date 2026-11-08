import { createElement } from 'react';
import type { GameAdapter } from '@rranker/sdk';
import museDashIcon from './assets/musedash.webp';

export const gameIds = ["musedash"] as const;


export const adapter = {
  refreshResources: async ({ queryClient, signal }) => { await require('./hooks/use-muse-dash').refreshMuseDashResources(queryClient); return {}; },
  accountRating: props => { const { AccountRating } = require('./components/MuseDashOverviewDetails') as typeof import('./components/MuseDashOverviewDetails'); return createElement(AccountRating, props); },
  storage: gameId => require('./storage').storage(gameId),
  pages: {
    overview: props => { const { OverviewPage } = require('./screens/OverviewPage') as typeof import('./screens/OverviewPage'); return createElement(OverviewPage, props); },
    library: props => { const { LibraryPage } = require('./screens/LibraryPage') as typeof import('./screens/LibraryPage'); return createElement(LibraryPage, props); },
    best: props => { const { MuseDashBestScreen } = require('./screens/MuseDashScreens') as typeof import('./screens/MuseDashScreens'); return createElement(MuseDashBestScreen, props); },
    records: props => { const { MuseDashRecordsScreen } = require('./screens/MuseDashScreens') as typeof import('./screens/MuseDashScreens'); return createElement(MuseDashRecordsScreen, props); },
    catalog: props => { const { MuseDashCatalogScreen } = require('./screens/MuseDashScreens') as typeof import('./screens/MuseDashScreens'); return createElement(MuseDashCatalogScreen, props); },
    detail: props => { const { DetailPage } = require('./screens/DetailPage') as typeof import('./screens/DetailPage'); return createElement(DetailPage, props); },
  },
  parseDetailParams: (gameId, params) => require('./domain/targets').parseDetailParams(gameId, params),
  parseLibraryTarget: value => require('./domain/targets').parseLibraryTarget(value), kind: 'game', id: 'game.musedash', title: "喵斯快跑", loadData: context => require('./services/game-data').loadData(context), getDataStatus: bundle => require('./domain/game-data').getDataStatus(bundle), summarizeData: bundle => require('./domain/game-data').summarizeData(bundle), games: [
{ id: 'musedash', accountOrder: 5, title: '喵斯快跑', icon: museDashIcon, profile: { ratingLabel: 'Rating', ratingDigits: 0, bestSections: [{ id: 'best30', title: 'Best 30', size: 30 }] } }
] } satisfies GameAdapter;

export type { MuseDashGameDataPayload } from './domain/game-data';
