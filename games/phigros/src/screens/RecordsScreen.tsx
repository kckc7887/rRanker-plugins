import { GameSearchHeader } from '@rranker/sdk/components/game-content/GameSearchHeader';
import { useCallback, useEffect, useMemo } from 'react';
import { EmptyDataView } from '@rranker/sdk/components/EmptyDataView';
import { RecordsListPage } from '@rranker/sdk/components/game-content/GameListPages';
import { useStableRangeBounds } from '@rranker/sdk/components/game-content/RangeSelector';
import { PhigrosFilterBar } from '@rranker/game-phigros/components/PhigrosFilterBar';
import { PhigrosScoreCard } from '@rranker/game-phigros/components/PhigrosScoreCard';
import { indexSongsById } from '@rranker/sdk/domain/song-index';
import { matchesAchievementRange, matchesConstantRange } from '@rranker/sdk/domain/range-filters';
import type { ScoreRecord, Song } from '@rranker/game-phigros/domain/models';
import { matchesPhigrosLevel, matchesPhigrosRankFilter } from '@rranker/game-phigros/domain/phigros-filters';
import { buildPhigrosKyouChartTagIndex, phigrosKyouChartHasAllTags } from '@rranker/game-phigros/domain/phigros-kyou';
import { matchesPhigrosXingFilter, phigrosChartNoteKey , buildPhigrosNoteTotalByKey } from '@rranker/game-phigros/domain/phigros-xing';
import { useLocalSearch } from '@rranker/sdk/hooks/use-local-search';
import { useDebouncedValue } from '@rranker/sdk/hooks/use-debounced-value';
import { useGameData } from '@rranker/sdk/hooks/use-game-data';
import { usePhigrosCatalog } from '@rranker/game-phigros/hooks/use-phigros-catalog';
import { usePhigrosKyouChartTags } from '@rranker/game-phigros/hooks/use-phigros-kyou';
import { usePhigrosRecordsFilter } from '@rranker/game-phigros/state/phigros-records-filter';
import { useSession } from '@rranker/sdk/state/session-store';
import { searchDocumentFor, searchDocumentMatches } from '@rranker/sdk/utils/search';

const phigrosRecordSongValues = (song: Song) => [song.id, song.title, ...(song.aliases ?? [])];

const phigrosRecordValues = (record: ScoreRecord) => [record.songId];

export function PhigrosRecordsScreen() {
  const activeAccountId = useSession((s) => s.activeAccountId);
  const gameData = useGameData();
  const catalogQuery = usePhigrosCatalog();
  const kyouChartTags = usePhigrosKyouChartTags();
  const {
    keyword, collapsed, level, constantMin, constantMax, accuracyMin, accuracyMax, rank, xing, chapter,
    selectedKyouTagIds,
    setKeyword, setCollapsed, setLevel, setConstantMin, setConstantMax, setAccuracyMin, setAccuracyMax,
    setRank, setXing, setChapter, setSelectedKyouTagIds,
    clearFilters,
  } = usePhigrosRecordsFilter();
  const debouncedKeyword = useDebouncedValue(keyword);
  const canReadScores = !!useSession(state => state.sourceClient);
  const phigrosPayload = gameData.data?.payload.kind === 'phigros' ? gameData.data.payload : null;
  const records = useMemo(
    () => phigrosPayload?.records ?? [],
    [phigrosPayload?.records],
  );

  const catalogSongs = useMemo(
    () => catalogQuery.data?.snapshot.songs ?? [],
    [catalogQuery.data?.snapshot.songs],
  );
  const constantValues = useMemo(() => [
    ...catalogSongs.flatMap((song) =>
      (song.charts ?? []).map((chart) => chart.difficultyConstant)),
    ...records.map((record) => record.difficultyConstant),
  ], [catalogSongs, records]);
  const constantBounds = useStableRangeBounds(
    constantValues,
    { minimum: 0, maximum: 20 },
    constantMin,
    constantMax,
    `${activeAccountId}:${catalogQuery.data?.snapshot.source.updatedAt ?? 'loading'}`,
  );
  const kyouTagIndex = useMemo(() => buildPhigrosKyouChartTagIndex(
    kyouChartTags.data,
    catalogQuery.data?.snapshot,
  ), [catalogQuery.data?.snapshot, kyouChartTags.data]);
  useEffect(() => {
    if (selectedKyouTagIds.length === 0) return;
    if (kyouChartTags.data) {
      const validIds = new Set(kyouChartTags.data.tags.map((tag) => tag.id));
      const next = selectedKyouTagIds.filter((tagId) => validIds.has(tagId));
      if (next.length !== selectedKyouTagIds.length) setSelectedKyouTagIds(next);
    } else if (kyouChartTags.isError) {
      setSelectedKyouTagIds([]);
    }
  }, [kyouChartTags.data, kyouChartTags.isError, selectedKyouTagIds, setSelectedKyouTagIds]);
  const chapterIdBySong = useMemo(() => {
    const map = new Map<string, number>();
    for (const song of catalogSongs) {
      if (song.versionId !== undefined) map.set(song.id, song.versionId);
    }
    return map;
  }, [catalogSongs]);
  const titleMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const song of catalogSongs) {
      map.set(song.id, song.title);
    }
    return map;
  }, [catalogSongs]);
  const noteTotalByKey = useMemo(
    () => buildPhigrosNoteTotalByKey(catalogSongs),
    [catalogSongs],
  );

  const catalogSongIndex = useMemo(() => indexSongsById(catalogSongs), [catalogSongs]);
  const filterSpec = useMemo(() => ({
    keyword: debouncedKeyword, level, constantMin, constantMax, accuracyMin, accuracyMax, rank, xing, chapter,
    selectedKyouTagIds,
  }), [accuracyMax, accuracyMin, chapter, constantMax, constantMin, debouncedKeyword, level, rank,
    selectedKyouTagIds, xing]);
  const selectRecord = useCallback((record: ScoreRecord, filters: typeof filterSpec) => {
    const song = catalogSongIndex.get(record.songId);
    const document = song
      ? searchDocumentFor(song, phigrosRecordSongValues)
      : searchDocumentFor(record, phigrosRecordValues);
    if (!searchDocumentMatches(document, filters.keyword)) return undefined;
    if (filters.chapter !== 'all' && chapterIdBySong.get(record.songId) !== Number(filters.chapter)) return undefined;
    if (filters.level !== 'all' && !matchesPhigrosLevel(record.levelIndex, filters.level)) return undefined;
    if (!matchesConstantRange(record.difficultyConstant, filters.constantMin, filters.constantMax)
      || !matchesAchievementRange(record.achievements, filters.accuracyMin, filters.accuracyMax)
      || !matchesPhigrosRankFilter(record, filters.rank)
      || !matchesPhigrosXingFilter(record, filters.xing, noteTotalByKey)) return undefined;
    if (kyouChartTags.data && filters.selectedKyouTagIds.length > 0
      && !phigrosKyouChartHasAllTags(kyouTagIndex, record.songId, record.levelIndex, filters.selectedKyouTagIds)) return undefined;
    return { record, title: titleMap.get(record.songId) ?? record.songId };
  }, [catalogSongIndex, chapterIdBySong, kyouChartTags.data, kyouTagIndex, noteTotalByKey, titleMap]);
  const { data: filtered, isFiltering } = useLocalSearch(records, filterSpec, selectRecord, catalogSongs);

  const isGameLoading = gameData.isLoading || catalogQuery.isLoading;
  const isGameError = gameData.isError || catalogQuery.isError;
  const error = gameData.error ?? catalogQuery.error;
  const refetchAll = () => {
    void Promise.all([gameData.refetch(), catalogQuery.refetch(), kyouChartTags.refetch()]);
  };
  const hasActiveFilters = !!(
    keyword.trim()
    || level !== 'all'
    || constantMin
    || constantMax
    || accuracyMin
    || accuracyMax
    || rank
    || xing
    || chapter !== 'all'
    || selectedKyouTagIds.length > 0
  );

  if (!canReadScores && !isGameLoading) {
    return (
      <EmptyDataView title="尚未绑定账号" detail="请在游戏管理中绑定 Phigros 的 TapTap 云存档" />
    );
  }

  const controls = <>
    <GameSearchHeader accessibilityLabel="成绩搜索"
      placeholder="曲名 / 别名 / 曲师 / 谱师" value={keyword} onChangeText={setKeyword} />
    <PhigrosFilterBar
      collapsed={collapsed} onCollapsedChange={setCollapsed}
      level={level} constantMin={constantMin} constantMax={constantMax}
      constantBounds={constantBounds}
      accuracyMin={accuracyMin} accuracyMax={accuracyMax} rank={rank} xing={xing}
      chapter={chapter} versions={catalogQuery.data?.snapshot.versions ?? []} onChapterChange={setChapter}
      kyouTags={kyouChartTags.data?.tags ?? []}
      selectedKyouTagIds={selectedKyouTagIds}
      kyouTagState={kyouChartTags.data ? 'ready' : kyouChartTags.isLoading ? 'loading' : 'unavailable'}
      onKyouTagIdsChange={setSelectedKyouTagIds}
      onLevelChange={setLevel} onConstantMinChange={setConstantMin} onConstantMaxChange={setConstantMax}
      onAccuracyMinChange={setAccuracyMin} onAccuracyMaxChange={setAccuracyMax}
      onRankChange={setRank} onXingChange={setXing}
      onReset={clearFilters}
    />
  </>;
  return (
    <RecordsListPage<{ record: ScoreRecord; title: string }>
      beforeList={controls}
      isLoading={isGameLoading || (isFiltering && filtered.length === 0)}
      isError={isGameError}
      isEmpty={!isGameLoading && filtered.length === 0}
      error={error}
      onRetry={refetchAll}
      emptyText={hasActiveFilters ? '筛选结果为空' : '暂无成绩数据'}
      data={!isGameLoading && filtered.length > 0 ? filtered : undefined}
      count={filtered.length} flatListProps={{
        testID: 'phigros-records-list',
        keyExtractor: (item) => recordKey(item.record),
        renderItem: ({ item }) => (
          <PhigrosScoreCard
            record={item.record}
            artworkSource={catalogQuery.data?.provider?.getIllustrationLowresUrl(item.record.songId)}
            catalogTitle={item.title}
            totalNotes={noteTotalByKey[
              phigrosChartNoteKey(item.record.songId, item.record.levelIndex)
            ]}
          />
        ),
      }}
    />
  );
}

function recordKey(record: ScoreRecord): string {
  return `${record.songId}-${record.type}-${record.levelIndex}`;
}
