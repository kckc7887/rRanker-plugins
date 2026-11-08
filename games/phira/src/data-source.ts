import type { QueryClient } from '@tanstack/react-query';
import type { PhiraPlayerSnapshot, PhiraBestSnapshot, PhiraChart, PhiraChartPage, PhiraChartStatus, PhiraUser, PhiraQueriedBest, PhiraNoteSnapshot, PhiraNoteCounts } from './domain/phira';

export type PhiraDataSource = {
  createDemoBest?: (chart: PhiraChart, counts?: PhiraNoteCounts | null) => PhiraQueriedBest;
  playerKey: readonly unknown[];
  bestsKey: readonly unknown[];
  readCached: () => Promise<PhiraPlayerSnapshot | null>;
  readFresh: (signal: AbortSignal) => Promise<PhiraPlayerSnapshot>;
  readBests: () => Promise<PhiraBestSnapshot | null>;
  refreshBests?: (snapshot: PhiraPlayerSnapshot, signal: AbortSignal) => Promise<PhiraBestSnapshot | null>;
};

export type PhiraBestRefreshStatus = 'success' | 'partial' | 'failed' | 'noop';
export type PhiraBestRefreshTarget = Pick<PhiraQueriedBest, 'chart' | 'poolRks'>;
export type PhiraBestRefreshFailure = {
  chartId: number;
  target: PhiraBestRefreshTarget;
  error: unknown;
};
export type PhiraBestRefreshSummary = {
  status: PhiraBestRefreshStatus;
  updatedChartIds: number[];
  failures: PhiraBestRefreshFailure[];
  requestedChartIds: number[];
};
export type PhiraBestRefreshResult = {
  refresh: PhiraBestRefreshSummary;
  snapshot: PhiraBestSnapshot | null;
};

export type PhiraResources = {
  getUser: (id: number, signal?: AbortSignal) => Promise<PhiraUser>;
  searchUsers: (query: string, signal?: AbortSignal) => Promise<PhiraUser[]>;
  getCharts: (input: { status: PhiraChartStatus; page: number; pageNum?: number; search?: string }, signal?: AbortSignal) => Promise<PhiraChartPage>;
  getChart: (id: number, signal?: AbortSignal) => Promise<PhiraChart>;
  getChartsByIds: (ids: readonly number[], signal?: AbortSignal) => Promise<PhiraChart[]>;
  getUploader: (id: number, signal?: AbortSignal) => Promise<PhiraUser>;
  loadPlayer: (queryClient: QueryClient, id: number, signal: AbortSignal) => Promise<PhiraPlayerSnapshot>;
  readPlayer: (id: number) => Promise<PhiraPlayerSnapshot | null>;
  readBests: (id: number) => Promise<PhiraBestSnapshot | null>;
  refreshPlayer: (id: number, signal: AbortSignal) => Promise<PhiraPlayerSnapshot>;
  refreshAllBests: (id: number, signal: AbortSignal) => Promise<PhiraBestRefreshResult>;
  refreshBestTargets: (id: number, targets: readonly PhiraBestRefreshTarget[], signal: AbortSignal) => Promise<PhiraBestRefreshResult>;
  queryChartBest: (id: number, chart: PhiraChart, poolRks: number | null, signal: AbortSignal) => Promise<{best: PhiraQueriedBest; snapshot: PhiraBestSnapshot}>;
  readNotes: (chart: PhiraChart, signal: AbortSignal) => Promise<PhiraNoteSnapshot>;
};
