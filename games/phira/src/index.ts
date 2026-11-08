import * as targets from './domain/targets';
import * as gameData from './domain/game-data';
import { createElement } from 'react';
import type { GameAdapter } from '@rranker/sdk';
import phiraIcon from './assets/phira.webp';

export const gameIds = ["phira"] as const;


export const adapter = {
  capabilities: ['chart.phigros'],
  storage: gameId => require('./storage').storage(gameId),
  pages: {
    overview: props => { const { OverviewPage } = require('./screens/OverviewPage') as typeof import('./screens/OverviewPage'); return createElement(OverviewPage, props); },
    library: props => { const { LibraryPage } = require('./screens/LibraryPage') as typeof import('./screens/LibraryPage'); return createElement(LibraryPage, props); },
    best: props => { const { PhiraBestScreen } = require('./screens/PhiraScreens') as typeof import('./screens/PhiraScreens'); return createElement(PhiraBestScreen, props); },
    records: props => { const { PhiraRecordsScreen } = require('./screens/PhiraScreens') as typeof import('./screens/PhiraScreens'); return createElement(PhiraRecordsScreen, props); },
    catalog: props => { const { PhiraCatalogScreen } = require('./screens/PhiraScreens') as typeof import('./screens/PhiraScreens'); return createElement(PhiraCatalogScreen, props); },
    detail: props => { const { DetailPage } = require('./screens/DetailPage') as typeof import('./screens/DetailPage'); return createElement(DetailPage, props); },
  },
  parseDetailParams: (gameId, params) => targets.parseDetailParams(gameId, params),
  parseLibraryTarget: value => targets.parseLibraryTarget(value), kind: 'game', id: 'game.phira', title: "Phira", loadData: async context => (await import('./services/game-data')).loadData(context), getDataStatus: bundle => gameData.getDataStatus(bundle), summarizeData: bundle => gameData.summarizeData(bundle), games: [
{ id: 'phira', accountOrder: 3, title: 'Phira', icon: phiraIcon, profile: { ratingLabel: 'Ranking Score', ratingDigits: 2, bestSections: [{ id: 'best20', title: 'Best20', size: 20 }] } }
] } satisfies GameAdapter;

export type { PhiraGameDataPayload } from './domain/game-data';
