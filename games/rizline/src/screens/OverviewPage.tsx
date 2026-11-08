import type { GameDataBundle } from '@rranker/sdk/data';
import { OverviewPageShell, type OverviewPresentation } from '@rranker/sdk/components/game-content/OverviewPageShell';
import { useGameData } from '@rranker/sdk/hooks/use-game-data';
import { formatRizlineRks, RIZLINE_RATING_THEME } from '../domain/rizline';

export function presentOverview(bundle: GameDataBundle | undefined): OverviewPresentation {
  const payload = bundle?.payload;
  if (payload?.kind !== 'rizline') return {
    displayName: payload?.kind === 'empty' ? payload.displayName : '',

  };

  return {
    displayName: payload.player.username,
    notice: payload.requiresLogin ? '登录已失效，请在游戏管理中重新绑定账号。' : undefined,
    ratingCard: {
      label: payload.playerScore.label, display: payload.playerScore.display,
      meta: `AH5（推定） ${formatRizlineRks(payload.best.ah5Contribution)} · B35（推定） ${formatRizlineRks(payload.best.b35Contribution)}`,
      accessibilityLabel: `${payload.playerScore.label} ${payload.playerScore.display}`,
      themeOverride: RIZLINE_RATING_THEME,
    },
  };
}

export function OverviewPage() {
  const query = useGameData();
  return <OverviewPageShell query={query} {...presentOverview(query.data)} />;
}
