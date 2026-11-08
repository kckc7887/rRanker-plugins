import { SongListSectionHeader } from '@rranker/sdk/components/game-content/SongListSectionHeader';
import { useMemo } from 'react';
import { BestImageEntryButton } from '@rranker/sdk/components/BestImageEntryButton';
import { EmptyDataView } from '@rranker/sdk/components/EmptyDataView';
import { BestListPage } from '@rranker/sdk/components/game-content/GameListPages';
import { ScoreRecordCard } from '@rranker/game-maimai/components/ScoreRecordCard';
import type { BestListSection } from '@rranker/game-maimai/domain/game-data';
import type { ScoreRecord } from '@rranker/game-maimai/domain/models';
import { useGameData } from '@rranker/sdk/hooks/use-game-data';

type BestSection = BestListSection & { data: ScoreRecord[] };

function byRating(left: ScoreRecord, right: ScoreRecord): number {
  return right.rating - left.rating || right.achievements - left.achievements;
}

export function MaimaiBest50Screen() {
  const { data, isLoading, isError, error, refetch } = useGameData();
  const sections = useMemo(() => {
    if (!data || data.payload.kind !== 'maimai') return [];
    return data.payload.bestSections.map((section) => ({
      ...section,
      data: [...section.records].sort(byRating),
    }));
  }, [data]);
  const recordCount = sections.reduce((sum, section) => sum + section.data.length, 0);
  const maimai = data?.payload.kind === 'maimai' ? data.payload : null;

  if (!isLoading && data && data.payload.kind !== 'maimai') {
    return <EmptyDataView title="暂无最佳成绩" detail="当前游戏暂未接入最佳成绩" />;
  }

  return (
    <BestListPage<ScoreRecord, BestSection>
      isLoading={isLoading}
      isError={isError}
      isEmpty={!!maimai && recordCount === 0}
      error={error}
      onRetry={refetch ? () => void refetch() : undefined}
      emptyText="当前账号暂无最佳成绩"
      data={recordCount > 0 ? sections : undefined}
      sectionListProps={{
        testID: 'best50-results-list',
        keyExtractor: (record) => `${record.songId}-${record.type}-${record.levelIndex}-${record.version}`,
        ListHeaderComponent: <BestImageEntryButton label="生成B50图片" />,
        renderSectionHeader: ({ section }) => <SongListSectionHeader title={section.title} value={`${section.data.length} 张谱面`} />,
        renderItem: ({ item, index }) => <ScoreRecordCard record={item} rank={index + 1} />,
      }}
    />
  );
}
