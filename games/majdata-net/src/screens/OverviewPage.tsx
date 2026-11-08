import type { GameDataBundle } from '@rranker/sdk/data';
import { OverviewPageShell, type OverviewPresentation } from '@rranker/sdk/components/game-content/OverviewPageShell';
import { useGameData } from '@rranker/sdk/hooks/use-game-data';


export function presentOverview(bundle: GameDataBundle | undefined): OverviewPresentation {
  const payload = bundle?.payload;
  if (payload?.kind !== 'majdata-net') return {
    displayName: payload?.kind === 'empty' ? payload.displayName : '',

  };

  return {
    displayName: payload.snapshot.player.username,

    ratingCard: {
      label: payload.playerScore.label, display: payload.playerScore.display,
      meta: '', fitValue: true,
      accessibilityLabel: `${payload.playerScore.label} ${payload.playerScore.display}`,
    },
  };
}

export function OverviewPage() {
  const query = useGameData();
  return <OverviewPageShell query={query} {...presentOverview(query.data)} />;
}
