import { SongListSectionHeader } from '@rranker/sdk/components/game-content/SongListSectionHeader';
import { useCallback, useMemo } from 'react';
import { type SectionListRenderItem } from 'react-native';
import { BestImageEntryButton } from '@rranker/sdk/components/BestImageEntryButton';
import { EmptyDataView } from '@rranker/sdk/components/EmptyDataView';
import { BestListPage } from '@rranker/sdk/components/game-content/GameListPages';
import { PhigrosScoreCard } from '@rranker/game-phigros/components/PhigrosScoreCard';
import type { BestListSection } from '@rranker/game-phigros/domain/game-data';
import type { ScoreRecord } from '@rranker/game-phigros/domain/models';
import { phigrosChartNoteKey , buildPhigrosNoteTotalByKey } from '@rranker/game-phigros/domain/phigros-xing';
import { useGameData } from '@rranker/sdk/hooks/use-game-data';
import { usePhigrosCatalog } from '@rranker/game-phigros/hooks/use-phigros-catalog';
import { useSession } from '@rranker/sdk/state/session-store';

type BestSection = BestListSection & { data: ScoreRecord[] };

function byRating(left: ScoreRecord, right: ScoreRecord): number {
  return right.rating - left.rating || right.achievements - left.achievements;
}

function sortPhigrosSection(sectionId: string, records: ScoreRecord[]): ScoreRecord[] {
  if (sectionId === 'phi3') {
    return [...records].sort(
      (a, b) => b.difficultyConstant - a.difficultyConstant || b.rating - a.rating,
    );
  }
  return [...records].sort(byRating);
}

export function PhigrosBestScreen() {
  const gameData = useGameData();
  const catalogQuery = usePhigrosCatalog();
  const canReadScores = !!useSession(state => state.sourceClient);
  const phigrosPayload = gameData.data?.payload.kind === 'phigros' ? gameData.data.payload : null;

  /** 无数据时保留数组引用，避免下游重复计算。 */
  const catalogSongs = useMemo(() => catalogQuery.data?.snapshot.songs ?? [], [catalogQuery.data]);
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

  const sections = useMemo(() => {
    if (!phigrosPayload) return [];
    return phigrosPayload.bestSections.map((section) => ({
      ...section,
      data: sortPhigrosSection(section.id, section.records),
    }));
  }, [phigrosPayload]);

  const recordCount = sections.reduce((sum, section) => sum + section.data.length, 0);
  const isGameLoading = gameData.isLoading || catalogQuery.isLoading;
  const isGameError = gameData.isError || catalogQuery.isError;
  const error = gameData.error ?? catalogQuery.error;
  const refetchAll = () => {
    void Promise.all([gameData.refetch(), catalogQuery.refetch()]);
  };

  const listHeader = (
    <BestImageEntryButton label="生成B30图片" />
  );
  const renderSectionHeader = useCallback(({ section }: { section: BestSection }) => (
    <SongListSectionHeader title={section.title} value={`${section.data.length} 张谱面`} />
  ), []);
  const renderItem: SectionListRenderItem<ScoreRecord, BestSection> = useCallback(
    ({ item, index }) => (
      <PhigrosScoreCard
        record={item}
        artworkSource={catalogQuery.data?.provider?.getIllustrationLowresUrl(item.songId)}
        catalogTitle={titleMap.get(item.songId) ?? item.songId}
        rank={index + 1}
        totalNotes={noteTotalByKey[phigrosChartNoteKey(item.songId, item.levelIndex)]}
      />
    ),
    [catalogQuery.data?.provider, noteTotalByKey, titleMap],
  );

  if (!canReadScores && !isGameLoading) {
    return (
      <EmptyDataView title="尚未绑定账号" detail="请在游戏管理中绑定 Phigros 的 TapTap 云存档" />
    );
  }

  return (
    <BestListPage<ScoreRecord, BestSection>
      isLoading={isGameLoading}
      isError={isGameError}
      isEmpty={!isGameLoading && recordCount === 0}
      error={error}
      onRetry={refetchAll}
      emptyText="当前账号暂无最佳成绩"
      data={!isGameLoading && recordCount > 0 ? sections : undefined}
      sectionListProps={{
        testID: 'phigros-best-results-list',
        keyExtractor: (record) => `${record.songId}-${record.levelIndex}`,
        ListHeaderComponent: listHeader,
        renderSectionHeader,
        renderItem,
      }}
    />
  );
}
