import { GameSearchHeader } from '@rranker/sdk/components/game-content/GameSearchHeader';
import { useCallback, useMemo } from 'react';
import { CatalogListPage } from '@rranker/sdk/components/game-content/GameListPages';
import { ChunithmFilterBar } from '@rranker/game-chunithm/components/ChunithmFilterBar';
import { ChunithmSongRow } from '@rranker/game-chunithm/components/ChunithmSongRow';
import type { ChunithmSong } from '@rranker/game-chunithm/domain/chunithm';
import { matchesChunithmChartFilter } from '@rranker/game-chunithm/domain/chunithm-filters';
import { useChunithmCatalog } from '@rranker/game-chunithm/hooks/use-chunithm-catalog';
import { useLocalSearch } from '@rranker/sdk/hooks/use-local-search';
import { useDebouncedValue } from '@rranker/sdk/hooks/use-debounced-value';
import { useChunithmCatalogFilter } from '@rranker/game-chunithm/state/chunithm-catalog-filter';
import { searchDocumentFor, findMatchedAlias, searchDocumentMatches } from '@rranker/sdk/utils/search';

const chunithmSearchValues = (song: ChunithmSong) => [
  String(song.id), song.title, song.artist ?? '', ...(song.aliases ?? []),
  ...song.difficulties.map((chart) => chart.noteDesigner ?? ''),
];

export function ChunithmSearchScreen() {
  const query = useChunithmCatalog();
  const {
    keyword, collapsed, difficulty, version, constantMin, constantMax,
    setKeyword, setCollapsed, setDifficulty, setVersion, setConstantMin, setConstantMax, clearFilters,
  } = useChunithmCatalogFilter();
  const debouncedKeyword = useDebouncedValue(keyword);
  const filterSpec = useMemo(() => ({
    keyword: debouncedKeyword,
    difficulty,
    version,
    constantMin,
    constantMax,
  }), [constantMax, constantMin, debouncedKeyword, difficulty, version]);
  const selectSong = useCallback((song: ChunithmSong, filters: typeof filterSpec) => {
    if (!searchDocumentMatches(searchDocumentFor(song, chunithmSearchValues), filters.keyword)) return undefined;
    const difficulties = song.difficulties.filter((chart) => matchesChunithmChartFilter(chart, filters));
    return difficulties.length ? { song, difficulties, matchedAlias: findMatchedAlias(song, filters.keyword) } : undefined;
  }, []);
  const { data: filtered, filter: deferredFilterSpec, isFiltering } = useLocalSearch(query.data?.songs, filterSpec, selectSong);
  const selectedVersionTitle = deferredFilterSpec.version === 'all'
    ? undefined
    : query.data?.versions.find((item) => String(item.id) === deferredFilterSpec.version)?.title;
  const hasActiveFilters = !!(
    keyword.trim()
    || difficulty !== 'all'
    || version !== 'all'
    || constantMin
    || constantMax
  );
  const controls = <>
    <GameSearchHeader accessibilityLabel="中二节奏歌曲搜索"
      placeholder="曲名 / ID / 别名 / 曲师 / 谱师" value={keyword} onChangeText={setKeyword}
      resultCountText={isFiltering ? '正在筛选…' : `共 ${filtered.length} 首`} />
    <ChunithmFilterBar
      collapsed={collapsed}
      constantMax={constantMax}
      constantMin={constantMin}
      difficulty={difficulty}
      onCollapsedChange={setCollapsed}
      onConstantMaxChange={setConstantMax}
      onConstantMinChange={setConstantMin}
      onDifficultyChange={setDifficulty}
      onReset={clearFilters}
      onVersionChange={setVersion}
      version={version}
      versions={query.data?.versions ?? []}
    />
  </>;
  return (
    <CatalogListPage<{ song: ChunithmSong; difficulties: ChunithmSong['difficulties']; matchedAlias?: string }>
      beforeList={controls}
      isLoading={query.isLoading || (isFiltering && filtered.length === 0)}
      isError={query.isError}
      isEmpty={!!query.data && filtered.length === 0}
      error={query.error}
      onRetry={() => void query.refetch()}
      emptyText={hasActiveFilters ? '筛选结果为空' : '暂无曲库数据'}
      data={query.data && filtered.length > 0 ? filtered : undefined}
      flatListProps={{
        testID: 'chunithm-catalog-results-list',
        keyExtractor: (item) => String(item.song.id),
        renderItem: ({ item }) => (
          <ChunithmSongRow
            displayedDifficulties={item.difficulties}
            displayedVersionTitle={selectedVersionTitle}
            matchedAlias={item.matchedAlias}
            song={item.song}
          />
        ),
      }}
    />
  );
}
