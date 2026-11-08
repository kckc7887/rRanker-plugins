import type { GameDataBundle } from '@rranker/sdk/data';
import { OverviewPageShell, type OverviewPresentation } from '@rranker/sdk/components/game-content/OverviewPageShell';
import { useGameData } from '@rranker/sdk/hooks/use-game-data';
import { formatPhigrosChallengeBadge, resolvePhigrosChallengeTheme } from '../domain/phigros-challenge-theme';

export function presentOverview(bundle: GameDataBundle | undefined): OverviewPresentation {
  const payload = bundle?.payload;
  if (payload?.kind !== 'phigros') return {
    displayName: payload?.kind === 'empty' ? payload.displayName : '',

  };

  return {
    displayName: payload.player.displayName,

    ratingCard: {
      label: payload.playerScore.label, display: payload.playerScore.display,
      meta: payload.bestSections.map(section => {
        const label = section.id === 'phi3' ? 'Phi3' : section.id.toUpperCase();
        if (!section.records.length) return `${label} —`;
        const average = section.records.reduce((sum, record) => sum + (section.id === 'phi3' ? record.difficultyConstant : record.rating), 0) / section.records.length;
        return `${label} ${average.toFixed(2)}`;
      }).join(' · '),
      themeOverride: resolvePhigrosChallengeTheme(payload.challengeModeRank),
      sideBadge: { title: '课题模式', value: formatPhigrosChallengeBadge(payload.challengeModeRank) },
    },
  };
}

export function OverviewPage() {
  const query = useGameData();
  return <OverviewPageShell query={query} {...presentOverview(query.data)} />;
}
