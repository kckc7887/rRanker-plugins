import { getChartDownload, gamePageHref, gameToolHref, usePluginRevision } from '@rranker/sdk';
import { majdataSongTarget, majdataChartTarget } from '@rranker/game-majdata-net/targets';
import { SongInformationCard } from '@rranker/sdk/components/game-content/SongInformationCard';
import { SongDetailChrome } from '@rranker/sdk/components/game-content/SongDetailChrome';
import { useStackScreenReady } from '@rranker/sdk/components/CachedTabScreen';
import { useMemo } from 'react';
import { ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Card } from '@rranker/sdk/components/Card';
import { GameSongCover } from '@rranker/sdk/components/game-content/GameSongCover';
import { QueryStateView } from '@rranker/sdk/components/QueryStateView';
import { LibraryTagEditor } from '@rranker/sdk/components/game-content/LibraryTagEditor';
import { AchievementValue, ScoreStatusBadges } from '@rranker/sdk/components/game-content/SimaiScoreVisuals';
import { ChartCarousel, type ChartCarouselItemState } from '@rranker/sdk/components/game-content/ChartCarousel';
import { ChartAction, GameChartResultCard, ToolDetailActions } from '@rranker/sdk/components/game-content/GameChartResultCard';
import { SimaiDifficultyRadar } from '@rranker/sdk/components/game-content/SimaiDifficultyRadar';
import {
  SimaiSongHero, SimaiSongMetadata, SimaiChartResultLayout, SimaiNoteTable, SimaiNoteStatus,
  simaiChartActionStyle, simaiChartActionTextStyle,
} from '@rranker/sdk/components/game-content/SimaiSongDetailLayout';
import { SIMAI_CHART_GAP, simaiSongDetailStyles as styles } from '@rranker/sdk/components/game-content/SimaiSongDetailStyles';
import { MAJDATA_NAMES, MAJDATA_ORDER, majdataAsset, majdataDefaultDifficulty, majdataNoteGroup, majdataTags, type MajdataSong, type MajdataScore } from '@rranker/game-majdata-net/domain/majdata';
import { useMajdataSong, useMajdataParsedChart } from '@rranker/game-majdata-net/hooks/use-majdata';
import { useGameData } from '@rranker/sdk/hooks/use-game-data';
import { useUserLibrary } from '@rranker/sdk/hooks/use-user-library';
import { useAppTheme } from '@rranker/sdk/theme/app-theme';
import { ProviderError } from '@rranker/sdk/providers/errors';

import { useChartPackageDownload } from '@rranker/sdk/features/chart-download-shared/use-chart-package-download';
import { MajdataDifficultyBadge, majdataVisual } from '@rranker/game-majdata-net/components/MajdataCards';
import type { MajdataDataSource } from '../data-source';
import { useSession } from '@rranker/sdk/state/session-store';


type Library = ReturnType<typeof useUserLibrary>;

export function MajdataSongDetail({ songId, initialLevelIndex }: { songId: string; initialLevelIndex?: number }) {
  const theme = useAppTheme();
  const query = useMajdataSong(songId);
  const song = query.data;
  const library = useUserLibrary();
  const local = library.data?.find(item => item.key === library.key(majdataSongTarget(songId)));
  const favorite = local?.kind === 'song' && local.favorite;
  const noData = query.error instanceof ProviderError && query.error.code === 'no_data';
  return <>
    <StatusBar style="light" />
    <View style={[styles.page, { backgroundColor: theme.background }]}>
      <QueryStateView data={song} isLoading={!song && query.isPending}
        isError={!song && query.isError && !noData} error={query.error}
        isEmpty={!song && (noData || query.isSuccess)} emptyText="找不到这首歌曲"
        onRetry={() => void query.refetch()}
        renderData={value => <MajdataDetailContent key={`${value.id}:${value.hash}:${initialLevelIndex ?? ''}`} song={value}
          initialLevelIndex={initialLevelIndex} library={library} />} />
      <SongDetailChrome songTitle={song?.title} favorite={favorite} favoriteDisabled={library.isLoading || library.isUpdating}
        onToggleFavorite={song ? () => void library.setSongFavorite(majdataSongTarget(song.id), !favorite) : undefined} />
    </View>
  </>;
}

function MajdataDetailContent({ song, initialLevelIndex, library }: { song: MajdataSong; initialLevelIndex?: number; library: Library }) {
  const theme = useAppTheme();
  const { width } = useWindowDimensions();
  const game = useGameData();

  const client = useSession(state => state.sourceClient) as MajdataDataSource | undefined;
  const records = game.data?.payload.kind === 'majdata-net' ? game.data.payload.snapshot.records : [];
  const levels = useMemo(() => MAJDATA_ORDER.filter(level => song.levels[level]?.trim()), [song.levels]);
  const initial = majdataDefaultDifficulty(song, initialLevelIndex);
  const initialIndex = Math.max(0, levels.findIndex(level => level === initial));
  const deferredReady = useStackScreenReady();
  const requestedMissing = initialLevelIndex !== undefined && !song.levels[initialLevelIndex]?.trim();
  const cardWidth = Math.max(280, width - 40);
  return <ScrollView testID="majdata-song-detail-scroll" contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
    <SimaiSongHero size={width} id={song.id} title={song.title} artist={song.artist || undefined}
      cover={<GameSongCover source={majdataAsset(song.id, 'image', true)} gameId="majdata-net" size={width} borderRadius={0} />} />
    <SimaiSongMetadata testIDPrefix="majdata-metadata" items={[
      { key: 'author', label: '作者', value: song.designer || '未提供', flex: 1 },
      { key: 'published', label: '发布时间', value: new Date(song.timestamp).toLocaleString(), flex: 1 },
    ]} />
    {deferredReady ? <>
      {requestedMissing ? <View style={styles.noCharts}><Text style={[styles.meta, { color: theme.textMuted }]}>所选难度不可用</Text></View>
        : <ChartCarousel items={levels} cardWidth={cardWidth} gap={SIMAI_CHART_GAP} initialIndex={initialIndex}
          accessibilityLabel="难度卡片" testID="majdata-chart-carousel" rootStyle={styles.carouselRoot} scrollStyle={styles.carouselScroll}
          contentContainerStyle={styles.carousel} keyExtractor={level => library.key(majdataChartTarget(song.id, level))}
          empty={<View style={styles.noCharts}><Text style={styles.meta}>暂无可用难度</Text></View>}
          renderItem={(level, carouselState) => <MajdataChartCard carouselState={carouselState} song={song} level={level} width={cardWidth} library={library}
            createDemoScore={client?.createDemoScore}
            best={records.find(score => score.chartInfo.id === song.id && score.chartLevel === level && score.hash === song.hash)} />} />}
      <View style={styles.details}>
        <SongInformationCard fields={[
          { label: '简介', value: song.description || '未提供' },
          { label: '标签', value: majdataTags(song).join('、') || '无' },
          { label: 'HASH', value: song.hash, selectable: true },
        ]} />
        <Card><ToolDetailActions target={majdataSongTarget(song.id)} />
 <LibraryTagEditor library={library} target={majdataSongTarget(song.id)}
          testID="majdata-song-local-tags" /></Card>
      </View>
    </> : <View testID="song-detail-deferred-placeholder" style={styles.deferredPlaceholder} />}
  </ScrollView>;
}

function MajdataChartCard({ song, level, width, library, best, carouselState, createDemoScore }: {
  song: MajdataSong; level: number; width: number; library: Library; best?: MajdataScore; carouselState: ChartCarouselItemState; createDemoScore?: MajdataDataSource['createDemoScore'];
}) {
  const theme = useAppTheme();
  const visual = majdataVisual(level);
  const parsed = useMajdataParsedChart(song, level);
  const download = getChartDownload('majdata-net');
  const downloadTask = useChartPackageDownload({ owner: download && { pluginId: download.pluginId, gameId: 'majdata-net' }, successMessage: '谱面文件已保存。' });
  const item = library.data?.find(entry => entry.key === library.key(majdataChartTarget(song.id, level)));
  const practice = item?.kind === 'chart' && item.practice;
  const counts = parsed.data?.statistics?.counts;
  const example = !!createDemoScore;
  const generated = createDemoScore && counts ? createDemoScore(song, level, counts) : undefined;
  const result = example ? generated?.dxScore === 0 ? undefined : generated : best;
  const notes = useMemo(() => majdataNoteGroup(counts), [counts]);
  const title = `${song.title} ${MAJDATA_NAMES[level]}`;
  const actions = simaiChartActionStyle(theme.dark, visual, false, level === 5);
  const actionText = simaiChartActionTextStyle(theme.dark, visual, false, level === 5);
  usePluginRevision();
  const previewHref = gamePageHref('majdata-net', 'chart-preview', {
    songId: song.id, levelIndex: String(level), hash: song.hash, title: song.title,
  });
  const toleranceHref = gameToolHref('majdata-net', 'tolerance', {
    songId: song.id, hash: song.hash, levelIndex: String(level),
  });
  const startDownload = () => {
    if (!download) return;
    carouselState.onDownloadRunningChange(true);
    void downloadTask.start((options, includeVideo) => download.run({
      title: song.title, songId: song.id, levelIndex: String(level),
    }, { ...options, includeVideo }), { optionalVideoUrl: majdataAsset(song.id, 'video') })
      .finally(() => carouselState.onDownloadRunningChange(false));
  };
  return <GameChartResultCard testID={`majdata-chart-card-${level}`} style={[styles.chartCard, {
    width, backgroundColor: theme.dark ? theme.surface : visual.tint, borderColor: visual.color,
  }]}>
    <SimaiChartResultLayout identity={<MajdataDifficultyBadge level={level} />} level={song.levels[level]}
      result={<AchievementValue value={result?.acc.dx} />}
      badges={<ScoreStatusBadges flowing achievements={result?.acc.dx} fc={result ? ['', 'fc', 'fcp', 'ap', 'app'][result.comboState] : undefined} />} />
    {parsed.data?.difficultyScores ? <SimaiDifficultyRadar scores={parsed.data.difficultyScores} color={visual.color} difficulty={String(level)} /> : null}
    {notes ? <SimaiNoteTable group={notes} accessibilityLabel="使用此谱面物量计算容错"
      onPress={toleranceHref ? () => router.push(toleranceHref) : undefined} />
      : <SimaiNoteStatus loading={!parsed.isError} onRetry={parsed.isError ? () => void parsed.refetch() : undefined} />}
    <ChartAction label={practice ? '已加入练习清单' : '加入练习清单'}
      disabled={library.isUpdating}
      onPress={() => void library.setChartPractice(majdataChartTarget(song.id, level), !practice)}
      stack="first" style={simaiChartActionStyle(theme.dark, visual, Boolean(practice), level === 5)}
      textStyle={simaiChartActionTextStyle(theme.dark, visual, Boolean(practice), level === 5)} />
    {previewHref ? <ChartAction label="查看谱面确认"
      accessibilityLabel={`查看谱面确认：${title}`}
      onPress={() => router.push(previewHref)}
      stack="next" style={actions}
      textStyle={actionText} /> : null}
    {download ? <ChartAction label="下载谱面文件"
      accessibilityLabel={`下载谱面文件：${title}`}
      disabled={downloadTask.isRunning}
      accessibilityState={{ disabled: downloadTask.isRunning }}
      onPress={startDownload}
      stack="next" style={actions}
      textStyle={actionText} /> : null}
    <ToolDetailActions target={majdataChartTarget(song.id, level)} />
    <LibraryTagEditor library={library} target={majdataChartTarget(song.id, level)}
      {...carouselState.tagEditor} testID={`majdata-chart-local-tags-${level}`} />
  </GameChartResultCard>;
}
