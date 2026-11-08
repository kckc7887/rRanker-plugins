import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Stack, router } from 'expo-router';
import { detailHref, pluginHref, type PluginDetailProps } from '@rranker/sdk';
import { ChartAction } from '@rranker/sdk/components/game-content/GameChartResultCard';
import { StrengthConclusion, StrengthPractice, StrengthSongsSheet } from '@rranker/sdk/components/game-content/StrengthAnalysis';
import { QueryStateView } from '@rranker/sdk/components/QueryStateView';
import { RandomChartsPage } from '@rranker/sdk/components/RandomChartsPage';
import { ExampleScoreCard } from '@rranker/game-example/components/ExampleSongContent';
import { ScoreCardArtworkScope } from '@rranker/sdk/components/game-content/GameScoreCard';
import { SimaiDifficultyRadar } from '@rranker/sdk/components/game-content/SimaiDifficultyRadar';
import { EXAMPLE_STRENGTH_AXES, EXAMPLE_STRENGTH_SCORES, type ExampleRecord } from '@rranker/game-example/domain/example';
import { pickRandomItems, type RandomChartsCount } from '@rranker/sdk/domain/random-charts';
import { useGameData } from '@rranker/sdk/hooks/use-game-data';
import { useAppTheme } from '@rranker/sdk/theme/app-theme';

export function ExampleDetailActions({ target }: PluginDetailProps) {
  const theme = useAppTheme();
  const href = target.kind === 'chart' ? pluginHref({ pluginId: 'tool.example', pageId: 'strength-analysis', gameId: target.gameId }) : null;
  return href ? <ChartAction label="查看实力分析" stack="next" onPress={() => router.push(href)}
    style={{ backgroundColor: theme.accent }} textStyle={{ color: theme.onAccent }} /> : null;
}

export function ExampleRandomChartsScreen() {
  const query = useGameData(); const records = query.data?.payload.kind === 'example' ? query.data.payload.records : [];
  const [count, setCount] = useState<RandomChartsCount>(1); const [results, setResults] = useState<ExampleRecord[] | null>(null);
  return <RandomChartsPage count={count} onCountChange={setCount} filter={null} poolSize={records.length}
    onDraw={() => setResults(pickRandomItems(records, count, `${Date.now()}-${Math.random()}`))}
    hasDrawn={results !== null} resultCount={results?.length ?? 0} drawDisabled={!records.length}
    results={<ScoreCardArtworkScope>{results?.map(record => <ExampleScoreCard key={record.song.id} record={record} />)}</ScoreCardArtworkScope>}
    emptyMessage="没有可抽取的歌曲" poolError={query.isError ? '无法读取示例数据，请重试。' : null} onRetryPool={() => void query.refetch()} />;
}

export function ExampleStrengthAnalysisScreen() {
  const theme = useAppTheme(); const query = useGameData(); const [axis, setAxis] = useState<number | null>(null);
  const records = query.data?.payload.kind === 'example' ? query.data.payload.records : undefined;
  const close = () => setAxis(null);
  return <View style={[styles.page, { backgroundColor: theme.background }]}>
    <Stack.Screen options={{ title: '实力分析' }} />
    <QueryStateView data={records} isLoading={query.isPending} isError={query.isError} error={query.error} isEmpty={!records?.length}
      emptyText="同步数据后可查看实力分析" onRetry={() => void query.refetch()}
      renderData={data => <ScrollView contentContainerStyle={styles.content}>
        <StrengthConclusion title="精度突出，耐力待提升">
          <SimaiDifficultyRadar scores={EXAMPLE_STRENGTH_SCORES} axisNames={EXAMPLE_STRENGTH_AXES}
            color={theme.accent} difficulty="example" onAxisPress={setAxis} />
        </StrengthConclusion>
        <StrengthPractice title="耐力练习">
          {data.slice(37, 40).map(record => <ExampleScoreCard key={record.song.id} record={record} />)}
        </StrengthPractice>
      </ScrollView>} />
    <StrengthSongsSheet visible={axis !== null} onClose={close}
      title={axis === null ? '' : `${EXAMPLE_STRENGTH_AXES[axis]} · ${EXAMPLE_STRENGTH_SCORES[axis].toFixed(1)}`}
      data={records?.slice(0, 10)}
      keyExtractor={record => record.song.id} renderItem={({ item }) => <ExampleScoreCard record={item} onPress={() => {
        close(); router.push(detailHref({ gameId: 'example', params: { songId: String(item.song.id), levelIndex: String(0) } }));
      }} />} />
  </View>;
}

const styles = StyleSheet.create({
  page: { flex: 1 }, content: { padding: 16, paddingBottom: 32, gap: 12 },
});
