import type { GameDataBundle } from '@rranker/sdk/data';
import { OverviewPageShell, type OverviewPresentation } from '@rranker/sdk/components/game-content/OverviewPageShell';
import { useGameData } from '@rranker/sdk/hooks/use-game-data';


export function presentOverview(bundle: GameDataBundle | undefined): OverviewPresentation {
  const payload = bundle?.payload;
  if (payload?.kind !== 'phira') return {
    displayName: payload?.kind === 'empty' ? payload.displayName : '',

  };

  return {
    displayName: payload.snapshot.player.name,
    librarySummary: 'songs',
    ratingCard: {
      label: payload.playerScore.label, display: payload.playerScore.display,
      meta: `总游玩次数 ${payload.snapshot.stats.numRecords}`,
      sideBadge: { title: '平均准确率', value: `${(payload.snapshot.stats.avgAccuracy * 100).toFixed(2)}%` },
    },
  };
}

export function OverviewPage() {
  const query = useGameData();
  return <OverviewPageShell query={query} {...presentOverview(query.data)} />;
}
