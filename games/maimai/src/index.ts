import * as targets from './domain/targets';
import * as gameData from './domain/game-data';
import { createElement } from 'react';
import type { GameAdapter } from '@rranker/sdk';
import type { DetailedCatalogProvider } from './data-source';
import maimaiIcon from './assets/maimai-dx.webp';

export const gameIds = ["maimai"] as const;


export const adapter = {
  scoreCardPreview: () => { const { ScoreCardPreview } = require('./components/ScoreRecordCard') as typeof import('./components/ScoreRecordCard'); return createElement(ScoreCardPreview); },
  capabilities: ['chart.simai'],
  refreshResources: async ({ queryClient, signal }) => { await (await import('./services/maimai-catalog-query')).refreshMaimaiCatalog(queryClient, ((await import('@rranker/sdk/registry')).resolveGameResources('maimai') as DetailedCatalogProvider | undefined) ?? null, signal); return {}; },
  accountRating: props => { const { AccountRating } = require('./components/DxRatingTag') as typeof import('./components/DxRatingTag'); return createElement(AccountRating, props); },
  storage: gameId => require('./storage').storage(gameId),
  pages: {
    overview: props => { const { OverviewPage } = require('./screens/OverviewPage') as typeof import('./screens/OverviewPage'); return createElement(OverviewPage, props); },
    library: props => { const { LibraryPage } = require('./screens/LibraryPage') as typeof import('./screens/LibraryPage'); return createElement(LibraryPage, props); },
    best: props => { const { MaimaiBest50Screen } = require('./screens/BestScreen') as typeof import('./screens/BestScreen'); return createElement(MaimaiBest50Screen, props); },
    records: props => { const { MaimaiRecordsScreen } = require('./screens/MaimaiRecordsScreen') as typeof import('./screens/MaimaiRecordsScreen'); return createElement(MaimaiRecordsScreen, props); },
    catalog: props => { const { MaimaiCatalogScreen } = require('./screens/MaimaiCatalogScreen') as typeof import('./screens/MaimaiCatalogScreen'); return createElement(MaimaiCatalogScreen, props); },
    detail: props => { const { DetailPage } = require('./screens/DetailPage') as typeof import('./screens/DetailPage'); return createElement(DetailPage, props); },
  },
  parseDetailParams: (gameId, params) => targets.parseDetailParams(gameId, params),
  parseLibraryTarget: value => targets.parseLibraryTarget(value), kind: 'game', id: 'game.maimai', title: "舞萌 DX", loadData: async context => (await import('./services/game-data')).loadData(context), getDataStatus: bundle => gameData.getDataStatus(bundle), summarizeData: bundle => gameData.summarizeData(bundle), games: [
{ id: 'maimai', accountOrder: 0, title: '舞萌 DX', icon: maimaiIcon, profile: { ratingLabel: 'DX RATING', ratingDigits: 5, bestSections: [
      { id: 'b35', title: '过往版本 Best35', size: 35 },
      { id: 'b15', title: '当前版本 Best15', size: 15 },
    ] } }
] } satisfies GameAdapter;

export type { MaimaiGameDataPayload } from './domain/game-data';
