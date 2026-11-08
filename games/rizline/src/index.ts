import { createElement } from 'react';
import type { GameAdapter, RatingTheme } from '@rranker/sdk';
import rizlineIcon from './assets/rizline.png';

export const gameIds = ["rizline"] as const;

export const RIZLINE_RATING_THEME: RatingTheme = {
  id: 'rizline', label: 'Rizline', fillColors: ['#B5D9D0', '#94C5B8', '#7AB1A3'], fillLocations: [0, 0.52, 1],
  borderColors: ['#52796F', '#3B6157'], borderLocations: [0, 1], overlayColor: 'rgba(75,78,85,0.10)',
  textColor: '#263C36', starColor: '#3B6157', starCount: 0,
};
export const adapter = {
  capabilities: ['chart.rizline'],
  refreshResources: async ({ queryClient, signal }) => { try { await require('./services/rizline-catalog-query').refreshRizlineCatalog(queryClient, signal); return {}; } catch (error) { if (signal.aborted) throw error; return { catalogFailed: true }; } },
  storage: gameId => require('./storage').storage(gameId),
  pages: {
    overview: props => { const { OverviewPage } = require('./screens/OverviewPage') as typeof import('./screens/OverviewPage'); return createElement(OverviewPage, props); },
    library: props => { const { LibraryPage } = require('./screens/LibraryPage') as typeof import('./screens/LibraryPage'); return createElement(LibraryPage, props); },
    best: props => { const { RizlineBestScreen } = require('./screens/RizlineScreens') as typeof import('./screens/RizlineScreens'); return createElement(RizlineBestScreen, props); },
    records: props => { const { RizlineRecordsScreen } = require('./screens/RizlineScreens') as typeof import('./screens/RizlineScreens'); return createElement(RizlineRecordsScreen, props); },
    catalog: props => { const { RizlineCatalogScreen } = require('./screens/RizlineScreens') as typeof import('./screens/RizlineScreens'); return createElement(RizlineCatalogScreen, props); },
    detail: props => { const { DetailPage } = require('./screens/DetailPage') as typeof import('./screens/DetailPage'); return createElement(DetailPage, props); },
  },
  parseDetailParams: (gameId, params) => require('./domain/targets').parseDetailParams(gameId, params),
  parseLibraryTarget: value => require('./domain/targets').parseLibraryTarget(value), kind: 'game', id: 'game.rizline', title: "Rizline", loadData: context => require('./services/game-data').loadData(context), getDataStatus: bundle => require('./domain/game-data').getDataStatus(bundle), summarizeData: bundle => require('./domain/game-data').summarizeData(bundle), games: [
{ id: 'rizline', title: 'Rizline', icon: rizlineIcon, accountScoreTheme: RIZLINE_RATING_THEME, profile: { ratingLabel: 'Ranking Score', ratingDigits: 4, bestSections: [{ id: 'ah5', title: 'AH5（推定）', size: 5 }, { id: 'b35', title: 'Best35（推定）', size: 35 }] } }
] } satisfies GameAdapter;

export type { RizlineGameDataPayload } from './domain/game-data';
