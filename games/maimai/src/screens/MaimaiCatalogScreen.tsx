import { maimaiSongTarget } from '@rranker/game-maimai/targets';
import { memo, useCallback, useEffect, useMemo } from 'react';
import { View, type ListRenderItem } from 'react-native';
import { CatalogListPage } from '@rranker/sdk/components/game-content/GameListPages';
import { GameSongRow, SongRowBadges } from '@rranker/sdk/components/game-content/GameSongRow';
import { GameSearchHeader } from '@rranker/sdk/components/game-content/GameSearchHeader';
import { MaimaiFilterBar, dxRatingTagFilterState, type VersionFilterOption } from '@rranker/game-maimai/components/MaimaiFilterBar';
import { ChartTypeBadge, DifficultyBadge } from '@rranker/game-maimai/components/ScoreVisuals';
import { SongCover } from '@rranker/game-maimai/components/SongCover';
import { buildDxRatingChartTagIndex, dxRatingChartHasAllTags } from '@rranker/game-maimai/domain/dxrating-chart-tags';
import { parseConstantBound } from '@rranker/sdk/domain/range-filters';
import { maimaiGenres, matchesMaimaiGenre } from '@rranker/game-maimai/domain/maimai-filters';
import type { Chart, ChartType, Song } from '@rranker/game-maimai/domain/models';
import { localizedVersionName } from '@rranker/game-maimai/domain/version-names';
import { presentMaimaiSong } from '@rranker/game-maimai/presentation';
import { useLocalSearch } from '@rranker/sdk/hooks/use-local-search';
import { useDebouncedValue } from '@rranker/sdk/hooks/use-debounced-value';
import { useDetailedCatalog } from '@rranker/game-maimai/hooks/use-detailed-catalog';
import { useDxRatingChartTags } from '@rranker/game-maimai/hooks/use-dxrating-chart-tags';
import { useUserLibrary } from '@rranker/sdk/hooks/use-user-library';
import { useCatalogFilter } from '@rranker/game-maimai/state/catalog-filter';
import { EMPTY_SONG_FILTERS, findMatchedAlias } from '@rranker/sdk/utils/search';
import { matchesSongSearch } from '@rranker/game-maimai/domain/search';

const TYPES: ChartType[] = ['SD', 'DX', 'UTAGE'];

export function MaimaiCatalogScreen() {
  const query = useDetailedCatalog();
  const dxRatingChartTags = useDxRatingChartTags();
  const library = useUserLibrary();
  const {
    keyword, collapsed, type, difficulty, constantMin, constantMax, version, genre, versionLocale, selectedDxRatingTagIds,
    setKeyword, setCollapsed, setType, setDifficulty, setConstantMin, setConstantMax, setVersion, setVersionLocale,
    setGenre, setSelectedDxRatingTagIds, clearFilters,
  } = useCatalogFilter();
  const debouncedKeyword = useDebouncedValue(keyword);
  const dxRatingTagIndex = useMemo(() => buildDxRatingChartTagIndex(
    dxRatingChartTags.data,
    query.data?.songs ?? [],
  ), [dxRatingChartTags.data, query.data?.songs]);

  useEffect(() => {
    if (selectedDxRatingTagIds.length === 0) return;
    if (!dxRatingChartTags.data) return;
    const validIds = new Set(dxRatingChartTags.data.tags.map((tag) => tag.id));
    const next = selectedDxRatingTagIds.filter((tagId) => validIds.has(tagId));
    if (next.length !== selectedDxRatingTagIds.length) setSelectedDxRatingTagIds(next);
  }, [dxRatingChartTags.data, selectedDxRatingTagIds, setSelectedDxRatingTagIds]);

  const versions = useMemo<VersionFilterOption[]>(() => (query.data?.versions ?? []).map((item) => ({
    value: String(item.id), name: item.title, versionId: item.id,
  })), [query.data?.versions]);
  const genres = useMemo(() => maimaiGenres(query.data?.songs ?? []), [query.data?.songs]);
  const filterSpec = useMemo(() => ({
    ...EMPTY_SONG_FILTERS,
    keyword: debouncedKeyword,
    genre,
    types: type === 'all' ? [] : [type],
    difficulties: difficulty === 'all' ? [] : [difficulty],
    constantMin: parseConstantBound(constantMin),
    constantMax: parseConstantBound(constantMax),
    chartVersionIds: version === 'all' ? [] : [Number(version)],
    selectedDxRatingTagIds,
  }), [constantMax, constantMin, debouncedKeyword, difficulty, genre, selectedDxRatingTagIds, type, version]);
  const selectSong = useCallback((song: Song, filters: typeof filterSpec) => {
    if (!matchesMaimaiGenre(song.genre, filters.genre)) return undefined;
    if (!matchesSongSearch(song, filters,
      dxRatingChartTags.data && filters.selectedDxRatingTagIds.length > 0
        ? (candidate, chart) => dxRatingChartHasAllTags(
            dxRatingTagIndex, candidate.id, chart.type, chart.levelIndex, filters.selectedDxRatingTagIds,
          )
        : undefined)) return undefined;
    return { song, matchedAlias: findMatchedAlias(song, filters.keyword) };
  }, [dxRatingChartTags.data, dxRatingTagIndex]);
  const { data: filtered, filter: deferredFilterSpec, isFiltering } = useLocalSearch(query.data?.songs, filterSpec, selectSong);
  const versionLabelsById = useMemo(() => new Map(versions.flatMap((option) =>
    option.versionId === undefined
      ? []
      : [[option.versionId, localizedVersionName(option.versionId, option.name, versionLocale)] as const],
  )), [versionLocale, versions]);
  const selectedChartVersionId = deferredFilterSpec.chartVersionIds[0];
  const selectedVersionLabel = selectedChartVersionId === undefined
    ? undefined
    : versionLabelsById.get(selectedChartVersionId) ?? String(selectedChartVersionId);
  const favoriteSongIds = useMemo(
    () => new Set((library.data ?? []).filter((item) => item.kind === 'song' && item.favorite).map((item) => item.target.songId)),
    [library.data],
  );
  const setSongFavorite = library.setSongFavorite;
  const toggleFavorite = useCallback((songId: string, favorite: boolean) => {
    void setSongFavorite(maimaiSongTarget(songId), favorite);
  }, [setSongFavorite]);
  const renderCatalogItem = useCallback<ListRenderItem<typeof filtered[number]>>(({ item: { song, matchedAlias } }) => (
    <CatalogSongRow
      song={song}
      favorite={favoriteSongIds.has(song.id)}
      favoritePending={library.isLoading || library.isUpdating}
      onFavoriteChange={toggleFavorite}
      selectedChartVersionId={selectedChartVersionId}
      selectedVersionLabel={selectedVersionLabel}
      versionLabelsById={versionLabelsById}
      matchedAlias={matchedAlias}
    />
  ), [
    favoriteSongIds,
    library.isLoading,
    library.isUpdating,
    selectedChartVersionId,
    selectedVersionLabel,
    toggleFavorite,
    versionLabelsById,
  ]);

  const controls = <>
    <GameSearchHeader accessibilityLabel="歌曲搜索"
      placeholder="曲名 / ID / 别名 / 曲师 / 谱师 / 罗马音" value={keyword} onChangeText={setKeyword}
      resultCountText={isFiltering ? '正在筛选…' : `共 ${filtered.length} 首`} />
    <MaimaiFilterBar collapsed={collapsed} onCollapsedChange={setCollapsed}
      difficulty={difficulty} version={version} type={type}
      genre={genre} genres={genres} onGenreChange={setGenre}
      constantMin={constantMin} constantMax={constantMax} versionLocale={versionLocale} versions={versions}
      dxRatingTags={dxRatingChartTags.data?.tags ?? []}
      selectedDxRatingTagIds={selectedDxRatingTagIds}
      dxRatingTagState={dxRatingTagFilterState(dxRatingChartTags)}
      onDifficultyChange={setDifficulty} onVersionChange={setVersion} onTypeChange={setType}
      onConstantMinChange={setConstantMin} onConstantMaxChange={setConstantMax}
      onVersionLocaleChange={setVersionLocale} onDxRatingTagIdsChange={setSelectedDxRatingTagIds}
      onReset={clearFilters} />
  </>;
  return (
    <CatalogListPage<typeof filtered[number]> beforeList={controls}
      isLoading={query.isLoading || (isFiltering && filtered.length === 0)} isError={query.isError}
      isEmpty={!!query.data && filtered.length === 0}
      error={query.error} onRetry={() => void query.refetch()} emptyText={keyword.trim() ? '筛选结果为空' : '暂无曲库数据'}
      data={query.data && filtered.length > 0 ? filtered : undefined}
      flatListProps={{
        testID: 'catalog-results-list',
        keyExtractor: (item) => item.song.id,
        renderItem: renderCatalogItem,
      }}
    />
  );
}

const CatalogSongRow = memo(function CatalogSongRow({
  song,
  favorite,
  favoritePending,
  onFavoriteChange,
  selectedChartVersionId,
  selectedVersionLabel,
  versionLabelsById,
  matchedAlias,
}: {
  song: Song;
  favorite: boolean;
  favoritePending: boolean;
  onFavoriteChange: (songId: string, favorite: boolean) => void;
  selectedChartVersionId?: number;
  selectedVersionLabel?: string;
  versionLabelsById: ReadonlyMap<number, string>;
  matchedAlias?: string;
}) {
  const presentation = presentMaimaiSong(song);
  const displayedCharts = selectedChartVersionId === undefined
    ? song.charts
    : song.charts.filter((chart) => chart.versionId === selectedChartVersionId);
  const displayedVersion = selectedVersionLabel ?? songChartVersionLabel(song, versionLabelsById);
  return <GameSongRow accessibilityLabel={null}
    presentation={presentation}
    matchedAlias={matchedAlias}
    subtitleContent={<>{song.artist ?? '曲师未知'} · {displayedVersion}</>}
    cover={<SongCover songId={song.id} />}
    badges={<SongChartBadges songId={song.id} charts={displayedCharts} />}
    favorite={favorite} favoritePending={favoritePending} onFavoriteChange={onFavoriteChange ? value => onFavoriteChange(song.id, value) : undefined}
  />;
});

function songChartVersionLabel(song: Song, versionLabelsById: ReadonlyMap<number, string>): string {
  const versionIds = new Set(song.charts.flatMap((chart) =>
    chart.versionId === undefined ? [] : [chart.versionId]));
  if (versionIds.size === 0) return song.version;
  if (versionIds.size === 1) {
    const [versionId] = versionIds;
    return versionLabelsById.get(versionId) ?? String(versionId);
  }
  return TYPES.flatMap((chartType) => {
    const typeVersionIds = [...new Set(song.charts.flatMap((chart) =>
      chart.type === chartType && chart.versionId !== undefined ? [chart.versionId] : []))];
    if (typeVersionIds.length === 0) return [];
    const labels = typeVersionIds.map((versionId) =>
      versionLabelsById.get(versionId) ?? String(versionId));
    return [`${chartType} ${labels.join(' / ')}`];
  }).join(' · ');
}

const SongChartBadges = memo(function SongChartBadges({ songId, charts }: { songId: string; charts: Chart[] }) {
  return <View testID={`song-chart-badges-${songId}`} accessibilityLabel="谱面定数" style={{ gap: 4 }}>
    {TYPES.map((chartType) => {
      const typeCharts = charts.filter((chart) => chart.type === chartType)
        .sort((left, right) => left.levelIndex - right.levelIndex);
      if (!typeCharts.length) return null;
      return <SongRowBadges key={chartType}>
        {chartType === 'UTAGE' ? null : <ChartTypeBadge type={chartType} />}
        {typeCharts.map((chart) => <DifficultyBadge key={`${chart.type}-${chart.levelIndex}`}
          difficulty={chart.difficulty} constant={chart.difficultyConstant} display="constant" compact
          specialLabel={chart.type === 'UTAGE'
            ? `${chart.utage?.kanji?.trim() || 'U·TA·GE'} ${chart.level}`.trim()
            : undefined} />)}
      </SongRowBadges>;
    })}
  </View>;
});
