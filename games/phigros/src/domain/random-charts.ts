import { chartVersionKey } from './catalog';

import { matchesAchievementRange, matchesConstantRange, parseAchievementBound } from '@rranker/sdk/domain/range-filters';

import type { CatalogSnapshot, ChartType, Difficulty, ScoreRecord } from '@rranker/game-phigros/domain/models';
import {
  matchesPhigrosLevel,
  matchesPhigrosRankFilter,
  type PhigrosRankFilter,
} from '@rranker/game-phigros/domain/phigros-filters';
import type { PhigrosLevel } from '@rranker/game-phigros/domain/phigros';
import {
  phigrosKyouChartHasAllTags,
  type PhigrosKyouChartTagIndex,
} from '@rranker/game-phigros/domain/phigros-kyou';
import {
  matchesPhigrosXingFilter,
  type PhigrosXingKind,
} from '@rranker/game-phigros/domain/phigros-xing';

export type PhigrosRandomChartFilters = {
  level: PhigrosLevel | 'all';
  constantMin: string;
  constantMax: string;
  accuracyMin: string;
  accuracyMax: string;
  rank: PhigrosRankFilter | null;
  xing: PhigrosXingKind | null;
  chapter: string | 'all';
  selectedKyouTagIds: number[];
};

export type RandomChartPick = {
  songId: string;
  title: string;
  artist?: string;
  type: ChartType;
  difficulty: Difficulty;
  levelIndex: number;
  difficultyConstant: number;
  played: boolean;
};

export function buildBestRecordMap(
  records: readonly ScoreRecord[],
): Map<string, ScoreRecord> {
  const best = new Map<string, ScoreRecord>();
  for (const record of records) {
    const key = chartVersionKey(record.songId, record.type, record.levelIndex);
    const current = best.get(key);
    if (!current || record.achievements > current.achievements) best.set(key, record);
  }
  return best;
}

function hasValidAchievementRange(minInput: string, maxInput: string): boolean {
  return parseAchievementBound(minInput) !== undefined
    || parseAchievementBound(maxInput) !== undefined;
}

export function filterPhigrosRandomCharts(
  catalog: CatalogSnapshot,
  records: readonly ScoreRecord[],
  filters: PhigrosRandomChartFilters,
  noteTotalByKey: Readonly<Record<string, number>>,
  kyouTagIndex?: PhigrosKyouChartTagIndex,
): RandomChartPick[] {
  const bestByChart = buildBestRecordMap(records);
  const selectedKyouTagIds = filters.selectedKyouTagIds ?? [];
  const scoreFilterActive = hasValidAchievementRange(
    filters.accuracyMin,
    filters.accuracyMax,
  ) || filters.rank !== null || filters.xing !== null;
  const picks: RandomChartPick[] = [];

  for (const song of catalog.songs) {
    if (filters.chapter !== 'all' && song.versionId !== Number(filters.chapter)) continue;
    const songId = song.id;
    for (const chart of song.charts) {
      if (!matchesPhigrosLevel(chart.levelIndex, filters.level)) continue;
      if (!matchesConstantRange(
        chart.difficultyConstant,
        filters.constantMin,
        filters.constantMax,
      )) continue;
      if (selectedKyouTagIds.length > 0 && (!kyouTagIndex || !phigrosKyouChartHasAllTags(
        kyouTagIndex,
        chart.songId,
        chart.levelIndex,
        selectedKyouTagIds,
      ))) continue;

      const key = chartVersionKey(chart.songId, chart.type, chart.levelIndex);
      const record = bestByChart.get(key);
      if (scoreFilterActive && !record) continue;
      if (record && !matchesAchievementRange(
        record.achievements,
        filters.accuracyMin,
        filters.accuracyMax,
      )) continue;
      if (record && !matchesPhigrosRankFilter(record, filters.rank)) continue;
      if (record && !matchesPhigrosXingFilter(record, filters.xing, noteTotalByKey)) continue;

      picks.push({
        songId,
        title: song.title,
        artist: song.artist,
        type: chart.type,
        difficulty: chart.difficulty,
        levelIndex: chart.levelIndex,
        difficultyConstant: chart.difficultyConstant,
        played: record !== undefined,
      });
    }
  }
  return picks;
}
