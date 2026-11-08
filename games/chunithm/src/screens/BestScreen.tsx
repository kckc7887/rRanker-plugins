import { SongListSectionHeader } from '@rranker/sdk/components/game-content/SongListSectionHeader';
import { useMemo } from 'react';
import { BestImageEntryButton } from '@rranker/sdk/components/BestImageEntryButton';
import { EmptyDataView } from '@rranker/sdk/components/EmptyDataView';
import { BestListPage } from '@rranker/sdk/components/game-content/GameListPages';
import { ChunithmScoreCard } from '@rranker/game-chunithm/components/ChunithmScoreCard';
import { buildChunithmScoreCards, compareChunithmScores, type ChunithmScoreCardData } from '@rranker/game-chunithm/domain/chunithm-score-presentation';
import type { ChunithmBestListSection } from '@rranker/game-chunithm/domain/game-data';
import { useGameData } from '@rranker/sdk/hooks/use-game-data';
import { useChunithmCatalog } from '@rranker/game-chunithm/hooks/use-chunithm-catalog';
import { useSession } from '@rranker/sdk/state/session-store';

type ChunithmBestSection = ChunithmBestListSection & { data: ChunithmScoreCardData[] };

export function ChunithmBestScreen() {
  const gameData = useGameData();
  const catalogQuery = useChunithmCatalog();
  const canReadScores = !!useSession(state => state.sourceClient);
  const payload = gameData.data?.payload.kind === 'chunithm' ? gameData.data.payload : null;

  const sections = useMemo<ChunithmBestSection[]>(() => {
    if (!payload || !catalogQuery.data) return [];
    return payload.bestSections.map((section) => ({
      ...section,
      data: buildChunithmScoreCards(section.scores, catalogQuery.data)
        .sort(compareChunithmScores),
    }));
  }, [catalogQuery.data, payload]);

  const recordCount = sections.reduce((sum, section) => sum + section.data.length, 0);
  const isGameLoading = gameData.isLoading || catalogQuery.isLoading;
  const isGameError = gameData.isError || catalogQuery.isError;
  const error = gameData.error ?? catalogQuery.error;
  const refetchAll = () => {
    void Promise.all([gameData.refetch(), catalogQuery.refetch()]);
  };

  if (!canReadScores && !isGameLoading) {
    return (
      <EmptyDataView title="尚未绑定账号" detail="请在游戏管理中绑定中二节奏账号" />
    );
  }

  return (
    <BestListPage<ChunithmScoreCardData, ChunithmBestSection>
      isLoading={isGameLoading}
      isError={isGameError}
      isEmpty={!isGameLoading && recordCount === 0}
      error={error}
      onRetry={refetchAll}
      emptyText="当前账号暂无 Best 30 与 New 20 成绩"
      data={!isGameLoading && recordCount > 0 ? sections : undefined}
      sectionListProps={{
        testID: 'chunithm-best-results-list',
        keyExtractor: (record, index) => `${record.songId}-${record.levelIndex}-${index}`,
        ListHeaderComponent: <BestImageEntryButton label="生成B50图片" />,
        renderSectionHeader: ({ section }) => (
          <SongListSectionHeader title={section.title} value={`${section.data.length} 张谱面`} />
        ),
        renderItem: ({ item, index }) => (
          <ChunithmScoreCard record={item} position={index + 1} />
        ),
      }}
    />
  );
}
