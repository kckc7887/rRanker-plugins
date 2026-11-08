import { GameSearchHeader } from '@rranker/sdk/components/game-content/GameSearchHeader';
import { useCallback, useMemo } from 'react';
import { EmptyDataView } from '@rranker/sdk/components/EmptyDataView';
import { RecordsListPage } from '@rranker/sdk/components/game-content/GameListPages';
import { useStableRangeBounds } from '@rranker/sdk/components/game-content/RangeSelector';
import { ChunithmFilterBar } from '@rranker/game-chunithm/components/ChunithmFilterBar';
import { ChunithmScoreCard } from '@rranker/game-chunithm/components/ChunithmScoreCard';
import { buildChunithmScoreCards, compareChunithmScores, type ChunithmScoreCardData } from '@rranker/game-chunithm/domain/chunithm-score-presentation';
import { matchesChunithmConstantRange, matchesChunithmRankRange } from '@rranker/game-chunithm/domain/chunithm-filters';
import { useChunithmCatalog } from '@rranker/game-chunithm/hooks/use-chunithm-catalog';
import { useLocalSearch } from '@rranker/sdk/hooks/use-local-search';
import { useDebouncedValue } from '@rranker/sdk/hooks/use-debounced-value';
import { useGameData } from '@rranker/sdk/hooks/use-game-data';
import { useChunithmRecordsFilter } from '@rranker/game-chunithm/state/chunithm-records-filter';
import { useSession } from '@rranker/sdk/state/session-store';
import { searchDocumentFor, searchDocumentMatches } from '@rranker/sdk/utils/search';

const chunithmRecordSearchValues = (card: ChunithmScoreCardData) => [card.title, card.songId, card.artist ?? '', card.noteDesigner ?? ''];

export function ChunithmRecordsScreen() {
  const canReadScores = !!useSession(state => state.sourceClient);
  const gameData = useGameData();
  const catalogQuery = useChunithmCatalog();
  const activeAccountId = useSession((state) => state.activeAccountId);
  const {
    keyword, collapsed, difficulty, version, constantMin, constantMax, rankMin, rankMax,
    setKeyword, setCollapsed, setDifficulty, setVersion, setConstantMin, setConstantMax,
    setRankMin, setRankMax, clearFilters,
  } = useChunithmRecordsFilter();
  const debouncedKeyword = useDebouncedValue(keyword);
  const payload = gameData.data?.payload.kind === 'chunithm'
    ? gameData.data.payload
    : null;
  const cards = useMemo(
    () => buildChunithmScoreCards(
      payload?.scores ?? [],
      catalogQuery.data,
    ).sort(compareChunithmScores),
    [catalogQuery.data, payload?.scores],
  );
  const constantValues = useMemo(() => catalogQuery.data?.songs.flatMap((song) =>
    song.difficulties
      .filter((item) => item.difficulty !== 5)
      .map((item) => item.levelValue)) ?? [],
  [catalogQuery.data?.songs]);
  const constantBounds = useStableRangeBounds(
    constantValues,
    { minimum: 0, maximum: 16 },
    constantMin,
    constantMax,
    `${activeAccountId}:${catalogQuery.data?.source.updatedAt ?? 'loading'}`,
  );
  const filterSpec = useMemo(() => ({
    keyword: debouncedKeyword,
    difficulty,
    version,
    constantMin,
    constantMax,
    rankMin,
    rankMax,
  }), [constantMax, constantMin, debouncedKeyword, difficulty, rankMax, rankMin, version]);
  const selectCard = useCallback((card: ChunithmScoreCardData, filters: typeof filterSpec) => {
    if (!searchDocumentMatches(searchDocumentFor(card, chunithmRecordSearchValues), filters.keyword)) return undefined;
    if (filters.difficulty !== 'all' && card.levelIndex !== filters.difficulty) return undefined;
    if (filters.version !== 'all' && String(card.versionId) !== filters.version) return undefined;
    if (!matchesChunithmConstantRange(card.difficultyConstant, filters.constantMin, filters.constantMax)
      || !matchesChunithmRankRange(card.rank, filters.rankMin, filters.rankMax)) return undefined;
    return card;
  }, []);
  const { data: filtered, isFiltering } = useLocalSearch(cards, filterSpec, selectCard);
  const hasActiveFilters = !!(
    keyword.trim()
    || difficulty !== 'all'
    || version !== 'all'
    || constantMin
    || constantMax
    || rankMin
    || rankMax
  );
  const isLoading = gameData.isLoading || catalogQuery.isLoading;
  const isError = gameData.isError || catalogQuery.isError;
  const error = gameData.error ?? catalogQuery.error;
  const retry = () => {
    void Promise.all([gameData.refetch(), catalogQuery.refetch()]);
  };

  if (!canReadScores && !isLoading) {
    return (
      <EmptyDataView
        detail="请在游戏管理中绑定中二节奏账号"
        title="尚未绑定账号"
      />
    );
  }

  const controls = <>
    <GameSearchHeader accessibilityLabel="中二成绩搜索"
      placeholder="曲名 / ID / 艺术家 / 谱师" value={keyword} onChangeText={setKeyword} />
    <ChunithmFilterBar
      collapsed={collapsed}
      constantBounds={constantBounds}
      constantMax={constantMax}
      constantMin={constantMin}
      difficulty={difficulty}
      onCollapsedChange={setCollapsed}
      onConstantMaxChange={setConstantMax}
      onConstantMinChange={setConstantMin}
      onDifficultyChange={setDifficulty}
      onRankMaxChange={setRankMax}
      onRankMinChange={setRankMin}
      onReset={clearFilters}
      onVersionChange={setVersion}
      rankMax={rankMax}
      rankMin={rankMin}
      version={version}
      versions={catalogQuery.data?.versions ?? []}
    />
  </>;
  return (
    <RecordsListPage<ChunithmScoreCardData>
      beforeList={controls}
      data={!isLoading && filtered.length ? filtered : undefined}
      emptyText={hasActiveFilters ? '当前筛选条件下没有中二成绩' : '落雪尚未同步中二成绩'}
      error={error}
      isEmpty={!isLoading && filtered.length === 0}
      isError={isError}
      isLoading={isLoading || (isFiltering && filtered.length === 0)}
      onRetry={retry}
      count={filtered.length} flatListProps={{
        keyExtractor: (item) => item.key,
        renderItem: ({ item }) => <ChunithmScoreCard record={item} />,
        testID: 'chunithm-records-list',
      }}
    />
  );
}
