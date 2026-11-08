import { exampleSongTarget, exampleChartTarget } from '@rranker/game-example/targets';
import { presentExampleRecord } from '@rranker/game-example/presentation';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Card } from '@rranker/sdk/components/Card';
import { QueryStateView } from '@rranker/sdk/components/QueryStateView';
import { RemoteImage } from '@rranker/sdk/components/RemoteImage';
import { LibraryTagEditor } from '@rranker/sdk/components/game-content/LibraryTagEditor';
import { LayeredGradientBadge } from '@rranker/sdk/components/LayeredGradientBadge';
import { useStackScreenReady } from '@rranker/sdk/components/CachedTabScreen';
import { DetailGestureRoot, DetailPressable } from '@rranker/sdk/components/game-content/DetailPressable';
import { SongDetailChrome } from '@rranker/sdk/components/game-content/SongDetailChrome';
import { GameChartResultCard, ToolDetailActions } from '@rranker/sdk/components/game-content/GameChartResultCard';
import { SongDetailHero } from '@rranker/sdk/components/game-content/SongDetailHero';
import { SongMetadataTable } from '@rranker/sdk/components/game-content/SongMetadataTable';
import { VERTICAL_SONG_DETAIL_STYLES as styles } from '@rranker/sdk/components/game-content/SongDetailChromeStyles';
import { EXAMPLE_DIFFICULTY_COLORS, type ExampleRecord } from '@rranker/game-example/domain/example';
import { useGameData } from '@rranker/sdk/hooks/use-game-data';
import { useUserLibrary } from '@rranker/sdk/hooks/use-user-library';
import { useAppTheme } from '@rranker/sdk/theme/app-theme';
import { ExampleDifficultyBadge, ExampleScoreValue } from '@rranker/game-example/components/ExampleSongContent';

type Library = ReturnType<typeof useUserLibrary>;

export function ExampleSongDetail({ songId }: { songId: string }) {
  const theme = useAppTheme(); const query = useGameData(); const library = useUserLibrary();
  const record = query.data?.payload.kind === 'example' ? query.data.payload.records.find(item => item.song.id === songId) : undefined;
  const entry = library.data?.find(item => item.key === library.key(exampleSongTarget(songId)));
  const favorite = entry?.kind === 'song' && entry.favorite;
  return <><StatusBar style="light" /><View style={[styles.page, { backgroundColor: theme.background }]}>
    <QueryStateView data={record} isLoading={query.isPending} isError={query.isError} error={query.error} isEmpty={!record}
      emptyText="找不到这首歌曲" onRetry={() => void query.refetch()}
      renderData={data => <ExampleDetailContent key={data.song.id} record={data} library={library} />} />
    <SongDetailChrome songTitle={record?.song.title} favorite={favorite} favoriteDisabled={library.isLoading || library.isUpdating}
      onToggleFavorite={record ? () => { void library.setSongFavorite(exampleSongTarget(songId), !favorite); } : undefined} />
  </View></>;
}

function ExampleDetailContent({ record, library }: { record: ExampleRecord; library: Library }) {
  const theme = useAppTheme(); const { width } = useWindowDimensions(); const ready = useStackScreenReady();
  const [coverFailed, setCoverFailed] = useState(false); const { song } = record;
  const presentation = presentExampleRecord(record);
  const chartKey = library.key(exampleChartTarget(song.id, 0));
  const chartItem = library.data?.find(item => item.key === chartKey);
  const practice = chartItem?.kind === 'chart' && chartItem.practice;
  const pending = library.isLoading || library.isUpdating;
  return <ScrollView contentContainerStyle={styles.content}>
    <SongDetailHero size={width} id={`ID${song.id}`} title={song.title} artist={song.artist} shadeColors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.65)']}
      cover={coverFailed ? undefined : <RemoteImage source={song.coverUrl} gameId="example" cacheProfile="artwork"
        contentFit="cover" style={StyleSheet.absoluteFill} onError={() => setCoverFailed(true)} />} />
    <SongMetadataTable accessibilityLabel={song.title} testIDPrefix="example-metadata" items={[
      { key: 'genre', label: '分类', value: song.genre, flex: 1 }, { key: 'bpm', label: 'BPM', value: String(song.bpm), flex: 1 },
      { key: 'version', label: '版本', value: song.version, flex: 1 },
    ]} />
    {ready ? <>
      <View style={localStyles.chartWrap}><LinearGradient colors={EXAMPLE_DIFFICULTY_COLORS}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={localStyles.chartBorder}>
        <GameChartResultCard style={[styles.chartCard, localStyles.chart, { backgroundColor: theme.surface }]}>
          <View style={styles.chartHeader}><ExampleDifficultyBadge /></View>
          <View style={localStyles.resultRow}>
            <View style={styles.resultBlock}><Text style={[styles.resultLabel, { color: theme.textMuted }]}>{presentation.primaryMetric.label}</Text>
              <ExampleScoreValue text={presentation.primaryMetric.text} large /><LayeredGradientBadge label="EX" tone="rainbow"
                style={localStyles.grade} textStyle={localStyles.gradeText} />
            </View>
            <View style={localStyles.rating}><Text style={[styles.resultLabel, { color: theme.textMuted }]}>Rating</Text>
              <Text style={[styles.statValue, { color: theme.text }]}>{record.rating}</Text></View>
          </View>
          <View style={[styles.chartDivider, { backgroundColor: theme.border }]} />
          <DetailGestureRoot><DetailPressable disabled={pending} onPress={() => { void library.setChartPractice(exampleChartTarget(song.id, 0), !practice); }}>
            <LinearGradient colors={EXAMPLE_DIFFICULTY_COLORS} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={localStyles.action}>
              <Text style={[styles.actionText, localStyles.actionText]}>{practice ? '移出练习清单' : '加入练习清单'}</Text>
            </LinearGradient>
          </DetailPressable></DetailGestureRoot>
          <ToolDetailActions target={exampleChartTarget(song.id, 0)} />
          <LibraryTagEditor library={library} target={exampleChartTarget(song.id, 0)}
            testID="example-chart-tags" disabled={pending} />
        </GameChartResultCard>
      </LinearGradient></View>
      <View style={styles.details}><Card><ToolDetailActions target={exampleSongTarget(song.id)} />
 <LibraryTagEditor library={library} target={exampleSongTarget(song.id)}
        testID="example-song-tags" disabled={pending} /></Card></View>
    </> : <View style={styles.deferredPlaceholder} />}
  </ScrollView>;
}

const localStyles = StyleSheet.create({
  chartWrap: { padding: 16 }, chartBorder: { padding: 2, borderRadius: 26 }, chart: { borderWidth: 0 },
  resultRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  rating: { alignItems: 'flex-end', gap: 4 }, action: { borderRadius: 11, padding: 12, alignItems: 'center', marginBottom: 14 },
  actionText: { color: '#FFFFFF' },
  grade: { height: 24, minWidth: 32 }, gradeText: { fontSize: 9, fontWeight: '900', paddingHorizontal: 6 },
});
