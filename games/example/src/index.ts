import * as targets from './domain/targets';
import * as gameData from './domain/game-data';
import { createElement } from 'react';
import type { GameAdapter, RatingTheme } from '@rranker/sdk';
import appIcon from './assets/icon.png';

export const gameIds = ["example"] as const;

export const EXAMPLE_RATING_THEME: RatingTheme = {
  id: 'example', label: 'EXAMPLE RATING',
  fillColors: ['#3B82F6', '#8B5CF6', '#EC4899', '#F43F5E'], fillLocations: [0, 0.34, 0.67, 1],
  borderColors: ['#93C5FD', '#C4B5FD', '#F9A8D4', '#FDA4AF'], borderLocations: [0, 0.34, 0.67, 1],
  overlayColor: 'transparent', textColor: '#FFFFFF', starColor: '#FFFFFF', starCount: 0,
};
export const adapter = {
  pages: {
    overview: props => { const { OverviewPage } = require('./screens/OverviewPage') as typeof import('./screens/OverviewPage'); return createElement(OverviewPage, props); },
    library: props => { const { LibraryPage } = require('./screens/LibraryPage') as typeof import('./screens/LibraryPage'); return createElement(LibraryPage, props); },
    best: props => { const { ExampleBestScreen } = require('./screens/ExampleScreens') as typeof import('./screens/ExampleScreens'); return createElement(ExampleBestScreen, props); },
    records: props => { const { ExampleRecordsScreen } = require('./screens/ExampleScreens') as typeof import('./screens/ExampleScreens'); return createElement(ExampleRecordsScreen, props); },
    catalog: props => { const { ExampleCatalogScreen } = require('./screens/ExampleScreens') as typeof import('./screens/ExampleScreens'); return createElement(ExampleCatalogScreen, props); },
    detail: props => { const { DetailPage } = require('./screens/DetailPage') as typeof import('./screens/DetailPage'); return createElement(DetailPage, props); },
  },
  parseDetailParams: (gameId, params) => targets.parseDetailParams(gameId, params),
  parseLibraryTarget: value => targets.parseLibraryTarget(value), kind: 'game', id: 'game.example', title: "示例游戏", loadData: async context => (await import('./services/game-data')).loadData(context), getDataStatus: bundle => gameData.getDataStatus(bundle), summarizeData: bundle => gameData.summarizeData(bundle), games: [
{ id: 'example', title: '示例游戏', icon: appIcon, accountScoreTheme: EXAMPLE_RATING_THEME, fixture: true, profile: { ratingLabel: 'EXAMPLE RATING', ratingDigits: 0, bestSections: [{ id: 'best30', title: 'Best 30', size: 30 }, { id: 'ranked10', title: 'Ranked 10', size: 10 }] } }
] } satisfies GameAdapter;

export type { ExampleGameDataPayload } from './domain/game-data';
