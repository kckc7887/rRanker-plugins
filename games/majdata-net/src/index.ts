import * as targets from './domain/targets';
import * as gameData from './domain/game-data';
import { createElement } from 'react';
import type { GameAdapter, RatingTheme } from '@rranker/sdk';
import majdataIcon from './assets/majdata.png';

export const gameIds = ["majdata-net"] as const;

export const NEUTRAL_RATING_THEME: RatingTheme = {
  id: 'empty', label: 'empty',
  fillColors: ['#2A3140', '#1A1F2A'], fillLocations: [0, 1],
  borderColors: ['#596273', '#303745'], borderLocations: [0, 1],
  overlayColor: 'transparent', textColor: '#FFFFFF', starColor: '#CBD5E1', starCount: 0,
};
export const adapter = {
  capabilities: ['chart.simai'],
  refreshResources: async ({ queryClient }) => { await (await import('./services/game-data')).invalidateMajdataCatalog(queryClient); return {}; },
  storage: gameId => require('./storage').storage(gameId),
  pages: {
    overview: props => { const { OverviewPage } = require('./screens/OverviewPage') as typeof import('./screens/OverviewPage'); return createElement(OverviewPage, props); },
    library: props => { const { LibraryPage } = require('./screens/LibraryPage') as typeof import('./screens/LibraryPage'); return createElement(LibraryPage, props); },
    best: props => { const { MajdataBestScreen } = require('./screens/MajdataScreens') as typeof import('./screens/MajdataScreens'); return createElement(MajdataBestScreen, props); },
    records: props => { const { MajdataRecordsScreen } = require('./screens/MajdataScreens') as typeof import('./screens/MajdataScreens'); return createElement(MajdataRecordsScreen, props); },
    catalog: props => { const { MajdataCatalogScreen } = require('./screens/MajdataScreens') as typeof import('./screens/MajdataScreens'); return createElement(MajdataCatalogScreen, props); },
    detail: props => { const { DetailPage } = require('./screens/DetailPage') as typeof import('./screens/DetailPage'); return createElement(DetailPage, props); },
  },
  parseDetailParams: (gameId, params) => targets.parseDetailParams(gameId, params),
  parseLibraryTarget: value => targets.parseLibraryTarget(value), kind: 'game', id: 'game.majdata-net', title: "Majdata Net", loadData: async context => (await import('./services/game-data')).loadData(context), getDataStatus: bundle => gameData.getDataStatus(bundle), summarizeData: bundle => gameData.summarizeData(bundle), games: [
{ id: 'majdata-net', title: 'Majdata Net', icon: majdataIcon, accountScoreTheme: NEUTRAL_RATING_THEME, profile: { ratingLabel: 'DX · Classic', ratingDigits: 4, bestSections: [{ id: 'recent', title: 'Recent', size: 0 }] } }
] } satisfies GameAdapter;

export type { MajdataGameDataPayload } from './domain/game-data';
