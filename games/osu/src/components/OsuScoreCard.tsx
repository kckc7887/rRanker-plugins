import { StyleSheet, Text, View } from 'react-native';
import { GameScoreCard, ScoreCardMetric } from '@rranker/sdk/components/game-content/GameScoreCard';
import type { OsuGameId } from '@rranker/game-osu';
import { formatOsuAccuracy, formatOsuPp, type OsuBestScore } from '@rranker/game-osu/domain/osu';
import { useAppTheme } from '@rranker/sdk/theme/app-theme';
import { OsuDifficultyBadge } from '@rranker/game-osu/components/OsuDifficultyBadge';
import { OsuModBadge } from '@rranker/game-osu/components/OsuModBadge';
import { OsuRankTag } from '@rranker/game-osu/components/OsuRankTag';

export function OsuScoreCard({ gameId, score, position, detailScoreId }: {
  gameId: OsuGameId;
  score: OsuBestScore;
  position?: number;
  detailScoreId?: number;
}) {
  const theme = useAppTheme();
  const ppText = score.pp == null ? '—' : formatOsuPp(score.pp);
  return (
    <GameScoreCard
      artwork={{ source: score.beatmapset.listCover }}
      presentation={{
        key: String(score.id),
        gameId,
        route: { gameId: gameId, params: { songId: String(score.beatmapset.id), beatmapId: String(score.beatmap.id), ...(detailScoreId === undefined ? {} : { scoreId: String(detailScoreId) }) } },
        position,
        title: score.beatmapset.title,
        accessibilityLabel: `成绩 ${score.beatmapset.title}，得分 ${score.score.toLocaleString('en-US')}，准确率 ${formatOsuAccuracy(score.accuracy)}，PP ${ppText}`,
        primaryMetric: {
          key: 'score',
          label: 'Score',
          text: score.score.toLocaleString('en-US'),
        },
        secondaryMetrics: [],
        difficulty: { key: 'difficulty', label: '★', value: '', tone: 'osu-star' },
        achievementRows: [],
      }}
      pressedStyle={styles.pressed}
      side={<ScoreCardMetric numericLabel label={formatOsuAccuracy(score.accuracy)} value={ppText} />}
      tagRows={{
        rows: [{
          content: (
            <>
              <OsuDifficultyBadge star={score.beatmap.difficultyRating} />
              <OsuRankTag rank={score.rank} testID={`osu-rank-tag-${score.rank}`} />
              {(score.mods ?? []).map((acronym) => (
                <OsuModBadge key={acronym} acronym={acronym} />
              ))}
            </>
          ),
          testID: 'osu-score-card-tags',
        }],
      }}
      testID={`osu-score-card-${score.id}`}
    >
      <View style={styles.scoreBlock}>
        <Text style={[styles.scoreLabel, { color: theme.textMuted }]}>Score</Text>
        <Text style={[styles.score, { color: theme.text }]}>
          {score.score.toLocaleString('en-US')}
        </Text>
      </View>
    </GameScoreCard>
  );
}

const styles = StyleSheet.create({
  scoreBlock: { gap: 1 },
  scoreLabel: { fontSize: 11, fontWeight: '700' },
  score: { fontSize: 24, fontWeight: '900', letterSpacing: 0.2 },
  pressed: { opacity: 0.7 },
});
