import type { GameDataLoaderContext } from '@rranker/sdk/data-load';
import type { PhigrosGameDataPayload } from './domain/game-data';
import type { PhigrosSummary } from './domain/phigros';

export type PhigrosDataSource = {
  loadPayload: (context: Pick<GameDataLoaderContext, 'queryClient' | 'hasSessionData' | 'signal' | 'assertCurrent'>) => Promise<PhigrosGameDataPayload>;
  getSummary?: (signal?: AbortSignal) => Promise<PhigrosSummary>;
  getSaveUpdatedAt?: () => string | null;
  getPushRecommendations?: (delta: number, chartCost: number, includePhi: boolean, signal?: AbortSignal) => Promise<import('./domain/phigros-push').PushRecommendationsResult>;
};

export type PhigrosResources = {
  loadAliases?: (signal?: AbortSignal) => Promise<import('./domain/phigros-kyou').PhigrosKyouAliasesSnapshot>;
  getChartTags?: (signal?: AbortSignal) => Promise<import('./domain/phigros-kyou').PhigrosKyouChartTagsSnapshot>;
  clearAliasesMemory?: () => void;
  getCatalog: (signal?: AbortSignal, checkChapters?: boolean) => Promise<import('./domain/models').CatalogSnapshot>;
  getGameVersion: (signal?: AbortSignal) => Promise<string>;
  getResourceUpdatedAt: () => string | null;
  getIllustrationUrl: (songId: string) => string | null;
  getIllustrationBlurUrl: (songId: string) => string | null;
  getIllustrationLowresUrl: (songId: string) => string | null;
  getAvatarUrl: (avatarId: string) => string | null;
};
