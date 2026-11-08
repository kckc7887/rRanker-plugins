import { MUSE_DASH_DIFFICULTY_LABELS } from '@rranker/game-musedash/domain/muse-dash';
import { museDashLevelTheme } from '@rranker/game-musedash/domain/musedash-level-theme';
import { isNumericMuseDashLevel } from '@rranker/game-musedash/presentation';
import { GameDifficultyBadge } from '@rranker/sdk/components/game-content/GameDifficultyBadge';

export type MuseDashDifficultyBadgeDisplay = 'constant' | 'label' | 'label-and-value';

export function MuseDashDifficultyBadge({
  levelIndex,
  level,
  constant,
  display = 'constant',
}: {
  levelIndex: number;
  level?: string;
  constant?: number;
  display?: MuseDashDifficultyBadgeDisplay;
}) {
  const colors = museDashLevelTheme(levelIndex);
  const label = MUSE_DASH_DIFFICULTY_LABELS[levelIndex];
  const constantText = constant === undefined ? undefined : constant.toFixed(2);
  const text = display === 'label'
    ? label
    : display === 'label-and-value'
      ? `${label} (${constantText ?? level ?? '—'})`
      : constantText != null
        ? (level && !isNumericMuseDashLevel(level) ? `${level} ${constantText}` : constantText)
        : level ?? '—';
  const accessibilityLabel = display === 'constant'
    ? `${label}，定数 ${constantText ?? '未知'}`
    : `${label}，标级 ${level ?? '未知'}，定数 ${constantText ?? '未知'}`;
  return <GameDifficultyBadge accessibilityLabel={accessibilityLabel} text={text} theme={colors} />;
}
