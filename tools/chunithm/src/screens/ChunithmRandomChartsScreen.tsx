import { detailHref } from '@rranker/sdk/navigation';
import { useEffect, useMemo, useState } from 'react';
import { router } from 'expo-router';
import { ChunithmDifficultyBadge } from '@rranker/game-chunithm/components/ChunithmDifficultyBadge';
import { ChunithmFilterBar } from '@rranker/game-chunithm/components/ChunithmFilterBar';
import { ChunithmScoreCard } from '@rranker/game-chunithm/components/ChunithmScoreCard';
import { QueryStateView } from '@rranker/sdk/components/QueryStateView';
import {
  RandomChartsPage,
  RandomUnplayedChartCard,
} from '@rranker/sdk/components/RandomChartsPage';
import type { ChunithmCatalogSnapshot } from '@rranker/game-chunithm/domain/chunithm';
import {
  chunithmRandomChartKey,
  filterChunithmRandomCharts,
  type ChunithmRandomChartPick,
} from '@rranker/game-chunithm/domain/chunithm-random-charts';
import { buildChunithmScoreCards } from '@rranker/game-chunithm/domain/chunithm-score-presentation';
import { pickRandomItems } from '@rranker/sdk/domain/random-charts';
import { useChunithmCatalog } from '@rranker/game-chunithm/hooks/use-chunithm-catalog';
import { useGameData } from '@rranker/sdk/hooks/use-game-data';
import { useChunithmRandomChartsFilter } from '@rranker/tool-chunithm/state/chunithm-random-charts-filter';

export function ChunithmRandomChartsScreen() {
  const catalogQuery = useChunithmCatalog();
  const gameData = useGameData();
  const {
    count, collapsed, difficulty, version, constantMin, constantMax, rankMin, rankMax,
    hydrate, persistenceError, setCount, setCollapsed, setDifficulty, setVersion, setConstantMin,
    setConstantMax, setRankMin, setRankMax, clearFilters,
  } = useChunithmRandomChartsFilter();
  const [results, setResults] = useState<ChunithmRandomChartPick[] | null>(null);
  const [lastSeed, setLastSeed] = useState<string | null>(null);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  const payload = gameData.data?.payload.kind === 'chunithm'
    ? gameData.data.payload
    : null;
  const scoreCards = useMemo(
    () => buildChunithmScoreCards(payload?.scores ?? [], catalogQuery.data),
    [catalogQuery.data, payload?.scores],
  );
  const scoreByChart = useMemo(() => new Map(scoreCards.map(record => [record.key, record])), [scoreCards]);
  const scoreFilterActive = rankMin !== null || rankMax !== null;
  const filters = useMemo(() => ({
    difficulty,
    version,
    constantMin,
    constantMax,
    rankMin,
    rankMax,
  }), [constantMax, constantMin, difficulty, rankMax, rankMin, version]);
  const pool = useMemo(
    () => catalogQuery.data
      ? filterChunithmRandomCharts(catalogQuery.data, scoreCards, filters)
      : [],
    [catalogQuery.data, filters, scoreCards],
  );

  const draw = () => {
    const seed = `${Date.now()}-${Math.random()}`;
    setLastSeed(seed);
    setResults(pickRandomItems(pool, count, seed));
  };
  const openDetail = (pick: ChunithmRandomChartPick) => router.push(detailHref({ gameId: 'chunithm', params: { songId: String(pick.songId), levelIndex: String(pick.levelIndex) } }));

  return (
    <QueryStateView<ChunithmCatalogSnapshot>
      data={catalogQuery.data}
      error={catalogQuery.error}
      isEmpty={false}
      isError={catalogQuery.isError}
      isLoading={catalogQuery.isLoading}
      onRetry={() => {
        void catalogQuery.refetch();
        void gameData.refetch();
      }}
      renderData={(data) => (
        <RandomChartsPage preferencesError={persistenceError} onRetryPreferences={() => void hydrate()}
          count={count}
          emptyMessage="没有符合条件的中二谱面，请放宽筛选后再试。"
          filter={(
            <ChunithmFilterBar
              collapsed={collapsed}
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
              versions={data.versions}
            />
          )}
          hasDrawn={results !== null}
          onCountChange={setCount}
          onDraw={draw}
          drawDisabled={!payload && scoreFilterActive}
          poolStatus={!payload ? gameData.isLoading ? '正在读取成绩…' : `候选谱面 ${pool.length} 条 · 成绩暂不可用` : undefined}
          poolError={catalogQuery.isError ? '曲库刷新失败，请重试。' : gameData.isError ? '成绩读取失败，请重试。' : null}
          onRetryPool={() => {
            if (catalogQuery.isError) void catalogQuery.refetch();
            if (gameData.isError) void gameData.refetch();
          }}
          poolSize={pool.length}
          resultCount={results?.length ?? 0}
          results={results?.map((pick) => {
            const key = `${lastSeed}-${chunithmRandomChartKey(pick)}`;
            const record = scoreByChart.get(chunithmRandomChartKey(pick));
            return record ? (
              <ChunithmScoreCard key={key} record={record} />
            ) : (
              <RandomUnplayedChartCard
                badge={(
                  <ChunithmDifficultyBadge
                    constant={pick.difficultyConstant}
                    display={pick.levelIndex === 5 ? 'label-and-value' : 'constant'}
                    levelIndex={pick.levelIndex}
                    worldsEndLabel={pick.worldsEndLabel}
                  />
                )}
                key={key}
                scoreAvailable={payload !== null}
                onPress={() => openDetail(pick)}
                title={pick.title}
              />
            );
          })}
        />
      )}
    />
  );
}
