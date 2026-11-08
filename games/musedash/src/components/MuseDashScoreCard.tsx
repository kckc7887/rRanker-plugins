import { memo } from 'react';
import { StyleSheet } from 'react-native';
import { LayeredGradientBadge } from '@rranker/sdk/components/LayeredGradientBadge';
import { MuseDashAccValue } from '@rranker/game-musedash/components/MuseDashAccValue';
import { MuseDashBadge } from '@rranker/game-musedash/components/MuseDashBadges';
import { MuseDashDifficultyBadge } from '@rranker/game-musedash/components/MuseDashDifficultyBadge';
import { museDashUserIdFromAccountId } from '@rranker/game-musedash/accounts';
import { museDashCoverUrl, museDashRankBadge, type MuseDashRawScore } from '@rranker/game-musedash/domain/muse-dash';
import { useMuseDashPlayDetail } from '@rranker/game-musedash/hooks/use-muse-dash';
import { useSession } from '@rranker/sdk/state/session-store';
import { GameScoreCard, ScoreCardMetric } from '@rranker/sdk/components/game-content/GameScoreCard';
import { presentMuseDashScore } from '@rranker/game-musedash/presentation';

export const MuseDashScoreCard = memo(function MuseDashScoreCard({
  score,
  position,
}: {
  score: MuseDashRawScore;
  position?: number;
}) {
  const accountId = useSession((state) => state.activeAccountId);
  const userId = museDashUserIdFromAccountId(accountId);
  const platform = score.play.platform ?? 'mobile';
  const detail = useMuseDashPlayDetail(score.play.uid, score.play.difficulty, platform, userId);
  const presentation = presentMuseDashScore(score, { detail: detail.data, position });
  const currentRank = score.play.i ?? score.play.history?.lastRank ?? 0;
  const rankBadge = museDashRankBadge(currentRank);
  const ratingText = presentation.secondaryMetrics.find((metric) => metric.key === 'rating')?.text ?? '—';
  return (
    <GameScoreCard
      artwork={{ source: museDashCoverUrl(score.song?.cover), scale: 1.08 }}
      presentation={presentation}
      pressedStyle={styles.pressed}
      side={<ScoreCardMetric label="Rating" value={ratingText} />}
      tagRows={{
        testID: `musedash-card-tags-${score.play.uid}-${score.play.difficulty}`,
        rows: [
          {
            content: <>
              <MuseDashDifficultyBadge
                constant={score.constant}
                display="label-and-value"
                level={score.song?.difficulty[score.play.difficulty]}
                levelIndex={score.play.difficulty}
              />
              {presentation.grade ? <MuseDashBadge label={presentation.grade.label} tone={presentation.grade.tone} /> : null}
              {presentation.achievementRows.flat().filter((badge) => badge.key === 'achievement').map((badge) => (
                <MuseDashBadge key={badge.key} label={badge.label} tone={badge.tone} />
              ))}
              {rankBadge ? (rankBadge.tone === 'rank-rainbow'
                ? <LayeredGradientBadge key="rank" label={rankBadge.label} numberOfLines={1} tone="rainbow"
                  style={styles.rainbowBadge} textStyle={styles.rainbowBadgeText} />
                : <MuseDashBadge key="rank" label={rankBadge.label} tone={rankBadge.tone} />) : null}
            </>,
          },
          {
            content: <>
              {presentation.achievementRows.flat().filter((badge) => badge.key !== 'achievement').map((badge) => (
                <MuseDashBadge key={badge.key} label={badge.label} />
              ))}
              <MuseDashBadge label={platform === 'pc' ? 'PC 端' : '移动端'} />
            </>,
          },
        ],
      }}
      testID={`musedash-score-${score.play.uid}-${score.play.difficulty}`}
    >
      <MuseDashAccValue acc={score.play.acc} />
    </GameScoreCard>
  );
});

const styles = StyleSheet.create({
  pressed: { opacity: 0.72 },
  rainbowBadge: { height: 28 },
  rainbowBadgeText: { fontSize: 10, fontWeight: '900' },
});
