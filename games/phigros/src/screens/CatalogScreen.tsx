import { phigrosSongTarget } from '@rranker/game-phigros/targets';
import { GameSearchHeader } from '@rranker/sdk/components/game-content/GameSearchHeader';
import { useCallback, useEffect, useMemo } from 'react';
import { type ListRenderItem } from 'react-native';
import { CatalogListPage } from '@rranker/sdk/components/game-content/GameListPages';
import { PhigrosFilterBar } from '@rranker/game-phigros/components/PhigrosFilterBar';
import { PhigrosSongRow } from '@rranker/game-phigros/components/PhigrosSongRow';
import { parseConstantBound } from '@rranker/sdk/domain/range-filters';
import type { Song } from '@rranker/game-phigros/domain/models';
import { phigrosLevelToDifficulty } from '@rranker/game-phigros/domain/phigros-filters';
import { buildPhigrosKyouChartTagIndex, phigrosKyouChartHasAllTags } from '@rranker/game-phigros/domain/phigros-kyou';
import { useLocalSearch } from '@rranker/sdk/hooks/use-local-search';
import { useDebouncedValue } from '@rranker/sdk/hooks/use-debounced-value';
import { usePhigrosCatalog } from '@rranker/game-phigros/hooks/use-phigros-catalog';
import { usePhigrosKyouChartTags } from '@rranker/game-phigros/hooks/use-phigros-kyou';
import { useUserLibrary } from '@rranker/sdk/hooks/use-user-library';
import { usePhigrosCatalogFilter } from '@rranker/game-phigros/state/phigros-catalog-filter';
import { EMPTY_SONG_FILTERS, findMatchedAlias, matchesSongSearch } from '@rranker/sdk/utils/search';

export function PhigrosSearchScreen() {
  const query = usePhigrosCatalog();
  const kyouChartTags = usePhigrosKyouChartTags();
  const library = useUserLibrary();
  const {
    keyword, collapsed, level, constantMin, constantMax, chapter, selectedKyouTagIds,
    setKeyword, setCollapsed, setLevel, setConstantMin, setConstantMax, setChapter,
    setSelectedKyouTagIds, clearFilters,
  } = usePhigrosCatalogFilter();
  const debouncedKeyword = useDebouncedValue(keyword);
  const kyouTagIndex = useMemo(() => buildPhigrosKyouChartTagIndex(
    kyouChartTags.data,
    query.data?.snapshot,
  ), [kyouChartTags.data, query.data?.snapshot]);
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
  const filterSpec = useMemo(() => ({
    ...EMPTY_SONG_FILTERS,
    keyword: debouncedKeyword,
    difficulties: level === 'all' ? [] : [phigrosLevelToDifficulty(level)],
    constantMin: parseConstantBound(constantMin),
    constantMax: parseConstantBound(constantMax),
    chartVersionIds: chapter === 'all' ? [] : [Number(chapter)],
    selectedKyouTagIds,
  }), [chapter, constantMax, constantMin, debouncedKeyword, level, selectedKyouTagIds]);
  const selectSong = useCallback((song: Song, filters: typeof filterSpec) => {
    if (!matchesSongSearch(song, filters,
      kyouChartTags.data && filters.selectedKyouTagIds.length > 0
        ? (candidate, chart) => phigrosKyouChartHasAllTags(
            kyouTagIndex, candidate.id, chart.levelIndex, filters.selectedKyouTagIds,
          )
        : undefined)) return undefined;
    return { song, matchedAlias: findMatchedAlias(song, filters.keyword) };
  }, [kyouChartTags.data, kyouTagIndex]);
  const { data: filtered, isFiltering } = useLocalSearch(query.data?.snapshot.songs, filterSpec, selectSong);
  const favoriteSongIds = useMemo(
    () => new Set((library.data ?? []).filter((item) => item.kind === 'song' && item.favorite).map((item) => item.target.songId)),
    [library.data],
  );
  const hasActiveFilters = !!(keyword.trim() || level !== 'all' || constantMin || constantMax
    || chapter !== 'all' || selectedKyouTagIds.length);
  const versions = useMemo(() => query.data?.snapshot.versions ?? [], [query.data?.snapshot.versions]);

  const provider = query.data?.provider ?? null;
  const blurUrls = useMemo(() => {
    const map = new Map<string, string>();
    if (!provider) return map;
    for (const { song } of filtered) {
      const url = provider.getIllustrationBlurUrl(song.id);
      if (url) map.set(song.id, url);
    }
    return map;
  }, [filtered, provider]);

  const setSongFavorite = library.setSongFavorite;
  const toggleFavorite = useCallback((songId: string, favorite: boolean) => {
    void setSongFavorite(phigrosSongTarget(songId), favorite);
  }, [setSongFavorite]);
  const renderPhigrosItem = useCallback<ListRenderItem<typeof filtered[number]>>(({ item: { song, matchedAlias } }) => (
    <PhigrosSongRow
      song={song}
      blurUrl={blurUrls.get(song.id) ?? null}
      favorite={favoriteSongIds.has(song.id)}
      favoritePending={library.isLoading || library.isUpdating}
      onFavoriteChange={toggleFavorite}
      matchedAlias={matchedAlias}
    />
  ), [
    blurUrls,
    favoriteSongIds,
    library.isLoading,
    library.isUpdating,
    toggleFavorite,
  ]);

  const controls = <>
    <GameSearchHeader accessibilityLabel="歌曲搜索"
      placeholder="曲名 / 别名 / 曲师 / 谱师" value={keyword} onChangeText={setKeyword}
      resultCountText={isFiltering ? '正在筛选…' : `共 ${filtered.length} 首`} />
    <PhigrosFilterBar
      collapsed={collapsed} onCollapsedChange={setCollapsed}
      level={level} constantMin={constantMin} constantMax={constantMax}
      onLevelChange={setLevel} onConstantMinChange={setConstantMin} onConstantMaxChange={setConstantMax}
      chapter={chapter} versions={versions} onChapterChange={setChapter}
      kyouTags={kyouChartTags.data?.tags ?? []}
      selectedKyouTagIds={selectedKyouTagIds}
      kyouTagState={kyouChartTags.data ? 'ready' : kyouChartTags.isLoading ? 'loading' : 'unavailable'}
      onKyouTagIdsChange={setSelectedKyouTagIds}
      onReset={clearFilters}
    />
  </>;
  return (
    <CatalogListPage<typeof filtered[number]>
      beforeList={controls}
      isLoading={query.isLoading || (isFiltering && filtered.length === 0)} isError={query.isError}
      isEmpty={!!query.data && filtered.length === 0}
      error={query.error} onRetry={() => void query.refetch()}
      emptyText={hasActiveFilters ? '筛选结果为空' : '暂无曲库数据'}
      data={query.data && filtered.length > 0 ? filtered : undefined}
      flatListProps={{
        testID: 'phigros-catalog-results-list',
        keyExtractor: (item) => item.song.id,
        renderItem: renderPhigrosItem,
      }}
    />
  );
}
