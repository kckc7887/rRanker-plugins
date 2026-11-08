import { AnimatedMetricValue } from '@rranker/sdk/components/game-content/AnimatedMetricValue';
import { phigrosScoreGradient } from '@rranker/game-phigros/domain/phigros-score-theme';
export function PhigrosScoreValue({ score, variant, ...props }: {
  score: number; variant: 'phi' | 'fc' | 'normal'; textColor: string;
  fontSize?: number; lineHeight?: number; accessibilityLabel?: string;
}) {
  return <AnimatedMetricValue {...props} text={score.toLocaleString()} gradient={phigrosScoreGradient(variant)} />;
}
