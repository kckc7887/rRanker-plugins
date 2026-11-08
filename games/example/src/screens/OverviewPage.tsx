import type { GameDataBundle } from '@rranker/sdk/data';
import { OverviewPageShell, type OverviewPresentation } from '@rranker/sdk/components/game-content/OverviewPageShell';
import { useGameData } from '@rranker/sdk/hooks/use-game-data';
import { EXAMPLE_RATING_THEME } from '../domain/example';

export function presentOverview(bundle: GameDataBundle | undefined): OverviewPresentation {
  const payload = bundle?.payload;
  if (payload?.kind !== 'example') return {
    displayName: payload?.kind === 'empty' ? payload.displayName : '',

  };

  return {
    displayName: payload.displayName,

    ratingCard: {
      label: payload.playerScore.label, display: payload.playerScore.display,
      meta: payload.bestSections.map(section => `${section.title} ${section.data.reduce((sum, record) => sum + record.rating, 0)}`).join(' · '),
      themeOverride: EXAMPLE_RATING_THEME, sideBadge: { title: 'EX RANK', value: 'ʐ' },
    },
  };
}

export function OverviewPage() {
  const query = useGameData();
  return <OverviewPageShell query={query} {...presentOverview(query.data)} />;
}
