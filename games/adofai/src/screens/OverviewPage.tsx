import type { GameDataBundle } from '@rranker/sdk/data';
import { OverviewPageShell, type OverviewPresentation } from '@rranker/sdk/components/game-content/OverviewPageShell';
import { useGameData } from '@rranker/sdk/hooks/use-game-data';
import { formatTufOverviewRatingMeta, formatTufRankBadge, TUF_RATING_THEME } from '../components/TufOverviewDetails';

export function presentOverview(bundle: GameDataBundle | undefined): OverviewPresentation {
  const payload = bundle?.payload;
  if (payload?.kind !== 'adofai') return {
    displayName: payload?.kind === 'empty' ? payload.displayName : '',

  };

  return {
    displayName: payload.player.name,
    librarySummary: 'songs', emptyText: '请在游戏管理中绑定 TUF 玩家',
    ratingCard: {
      label: payload.playerScore.label, display: payload.playerScore.display,
      meta: formatTufOverviewRatingMeta(payload.player), themeOverride: TUF_RATING_THEME,
      sideBadge: { title: '世界排名', value: formatTufRankBadge(payload.player) },
    },
  };
}

export function OverviewPage() {
  const query = useGameData();
  return <OverviewPageShell query={query} {...presentOverview(query.data)} />;
}
