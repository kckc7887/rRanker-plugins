import { chartVersionKey, normalizeSongId } from '@rranker/game-maimai/domain/catalog';
import {
  buildDxRatingChartTagIndex,
  dxRatingChartHasAllTags,
  type DxRatingChartTagsSnapshot,
} from '@rranker/game-maimai/domain/dxrating-chart-tags';
import { matchesAchievementRange, matchesConstantRange, parseAchievementBound } from '@rranker/sdk/domain/range-filters';
import { matchesMaimaiGenre, matchesMultiAchievementFilter, matchesSoloAchievementFilter, type MaimaiFcAchievement, type MaimaiFsAchievement } from '@rranker/game-maimai/domain/maimai-filters';
import type { CatalogSnapshot, ChartType, Difficulty, ScoreRecord } from '@rranker/game-maimai/domain/models';





export type MaimaiRandomChartFilters = {
  difficulty: Difficulty | 'all';
  version: string | 'all';
  genre: string;
  type: ChartType | 'all';
  constantMin: string;
  constantMax: string;
  achievementMin: string;
  achievementMax: string;
  soloAchievement: MaimaiFcAchievement | null;
  multiAchievement: MaimaiFsAchievement | null;
  selectedDxRatingTagIds: number[];
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

export function filterMaimaiRandomCharts(
  catalog: CatalogSnapshot,
  records: readonly ScoreRecord[],
  filters: MaimaiRandomChartFilters,
  tags?: DxRatingChartTagsSnapshot,
): RandomChartPick[] {
  const bestByChart = buildBestRecordMap(records);
  const versionTitleById = new Map(catalog.versions.map((version) => [version.id, version.title]));
  const scoreFilterActive = hasValidAchievementRange(
    filters.achievementMin,
    filters.achievementMax,
  ) || filters.soloAchievement !== null || filters.multiAchievement !== null;
  const hasConstantFilter = !!(filters.constantMin || filters.constantMax);
  if (filters.selectedDxRatingTagIds.length > 0 && tags === undefined) return [];
  const tagFilterActive = tags !== undefined && filters.selectedDxRatingTagIds.length > 0;
  const tagIndex = tagFilterActive ? buildDxRatingChartTagIndex(tags, catalog.songs) : new Map();
  const picks: RandomChartPick[] = [];

  for (const song of catalog.songs) {
    if (song.disabled) continue;
    if (!matchesMaimaiGenre(song.genre, filters.genre)) continue;
    const songId = normalizeSongId(song.id);
    for (const chart of song.charts) {
      if (filters.difficulty !== 'all' && chart.difficulty !== filters.difficulty) continue;
      if (filters.type !== 'all' && chart.type !== filters.type) continue;
      const chartVersion = chart.versionId === undefined
        ? song.version
        : versionTitleById.get(chart.versionId) ?? String(chart.versionId);
      if (filters.version !== 'all' && chartVersion !== filters.version) continue;
      if (chart.type === 'UTAGE' && hasConstantFilter) continue;
      if (!matchesConstantRange(
        chart.difficultyConstant,
        filters.constantMin,
        filters.constantMax,
      )) continue;
      if (tagFilterActive && !dxRatingChartHasAllTags(
        tagIndex,
        chart.songId,
        chart.type,
        chart.levelIndex,
        filters.selectedDxRatingTagIds,
      )) continue;

      const key = chartVersionKey(chart.songId, chart.type, chart.levelIndex);
      const record = bestByChart.get(key);
      if (scoreFilterActive && !record) continue;
      if (record && !matchesAchievementRange(
        record.achievements,
        filters.achievementMin,
        filters.achievementMax,
      )) continue;
      if (record && !matchesSoloAchievementFilter(record, filters.soloAchievement)) continue;
      if (record && !matchesMultiAchievementFilter(record, filters.multiAchievement)) continue;

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
