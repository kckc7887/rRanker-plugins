import { useMemo, useState } from 'react';
import { RandomChartsPage } from '@rranker/sdk/components/RandomChartsPage';
import { PhiraScoreCard } from '@rranker/game-phira/components/PhiraScoreCard';
import { PhiraFilterBar } from '@rranker/game-phira/components/PhiraFilterBar';
import { phiraPlayerIdFromAccountId } from '@rranker/game-phira/accounts';
import { pickRandomItems, type RandomChartsCount } from '@rranker/sdk/domain/random-charts';
import type { PhiraQueriedBest } from '@rranker/game-phira/domain/phira';
import { filterPhiraBests } from '@rranker/game-phira/domain/phira-filters';
import { usePhiraBests } from '@rranker/game-phira/hooks/use-phira';
import { useSession } from '@rranker/sdk/state/session-store';
import { usePhiraRecordsFilter } from '@rranker/game-phira/state/phira-records-filter';

export function PhiraRandomChartsScreen() {
  const accountId = useSession((state) => state.activeAccountId);
  const id = phiraPlayerIdFromAccountId(accountId);
  const query = usePhiraBests(id); const [count, setCount] = useState<RandomChartsCount>(1); const [results, setResults] = useState<PhiraQueriedBest[]>([]); const [drawn, setDrawn] = useState(false);
  const filter = usePhiraRecordsFilter();
  const pool = useMemo(() => filterPhiraBests(Object.values(query.data?.items ?? {}), filter), [filter, query.data?.items]);
  const draw = () => { setResults(pickRandomItems(pool, count, `${Date.now()}-${Math.random()}`)); setDrawn(true); };
  return <RandomChartsPage count={count} onCountChange={setCount} filter={
    <PhiraFilterBar collapsible={false}
      collapsed={false} onCollapsedChange={() => undefined}
      constantMin={filter.constantMin} constantMax={filter.constantMax}
      accuracyMin={filter.accuracyMin} accuracyMax={filter.accuracyMax}
      rank={filter.rank} xing={filter.xing} onConstantMinChange={filter.setConstantMin}
      onConstantMaxChange={filter.setConstantMax} onAccuracyMinChange={filter.setAccuracyMin}
      onAccuracyMaxChange={filter.setAccuracyMax} onRankChange={filter.setRank}
      onXingChange={filter.setXing} onReset={filter.clearFilters} />}
    poolSize={pool.length} onDraw={draw} hasDrawn={drawn} resultCount={results.length} results={results.map((item) => <PhiraScoreCard key={item.chart.id} item={item} />)}
    emptyMessage="没有可抽取的歌曲" drawDisabled={id === null || !pool.length}
    poolStatus={accountId === 'phira:test' ? '当前示例账号暂不支持随机抽取' : id === null ? '请先绑定 Phira 玩家' : undefined}
    poolError={query.error ? '无法读取成绩，请重试。' : null} onRetryPool={() => void query.refetch()} />;
}
