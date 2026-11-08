import { memo } from 'react';
import { GameScoreCard, ScoreCardMetric, ScoreCardBadges } from '@rranker/sdk/components/game-content/GameScoreCard';
import type { RizlineRecord } from '@rranker/game-rizline/domain/rizline';
import { presentRizlineScore } from '@rranker/game-rizline/presentation';
import { RizlineAccuracyValue, RizlineDifficultyBadge, RizlineStatusBadge } from '@rranker/game-rizline/components/RizlineScoreVisuals';

export const RizlineScoreCard = memo(function RizlineScoreCard({ record, title, rank, artworkSource }: {
  record: RizlineRecord; title?: string; rank?: number; artworkSource?: string | null;
}) {
  const presentation = presentRizlineScore(record, title, rank);
  return <GameScoreCard testID={`rizline-score-${record.chartId}`} presentation={presentation}
    artwork={{ source: artworkSource }}
    side={<ScoreCardMetric label={presentation.secondaryMetrics[0]?.label} value={presentation.secondaryMetrics[0]?.text} />}>
    <RizlineAccuracyValue record={record} text={presentation.primaryMetric.text} />
    <ScoreCardBadges><RizlineDifficultyBadge difficulty={record.difficulty} level={record.chart?.level} /><RizlineStatusBadge record={record} /></ScoreCardBadges>
  </GameScoreCard>;
});
