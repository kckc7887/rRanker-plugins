import type { GameDataBundle } from '@rranker/sdk/data';
import { OverviewPageShell, type OverviewPresentation } from '@rranker/sdk/components/game-content/OverviewPageShell';
import { useGameData } from '@rranker/sdk/hooks/use-game-data';
import { formatMuseDashOverviewRatingMeta, MUSE_DASH_RATING_THEME } from '../components/MuseDashOverviewDetails';

export function presentOverview(bundle: GameDataBundle | undefined): OverviewPresentation {
  const payload = bundle?.payload;
  if (payload?.kind !== 'musedash') return {
    displayName: payload?.kind === 'empty' ? payload.displayName : '',
    isEmpty: true, emptyText: '请在游戏管理中绑定喵斯快跑玩家',

  };

  return {
    displayName: payload.player.user.nickname,
    emptyText: '请在游戏管理中绑定喵斯快跑玩家',
    ratingCard: {
      label: payload.playerScore.label, display: payload.playerScore.display,
      meta: formatMuseDashOverviewRatingMeta(payload.player), themeOverride: MUSE_DASH_RATING_THEME,
    },
  };
}

export function OverviewPage() {
  const query = useGameData();
  return <OverviewPageShell query={query} {...presentOverview(query.data)} />;
}
