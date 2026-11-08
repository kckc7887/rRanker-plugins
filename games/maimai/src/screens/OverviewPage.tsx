import { resolveRatingTheme } from '../domain/dx-rating-theme';
import type { GameDataBundle } from '@rranker/sdk/data';
import { OverviewPageShell, type OverviewPresentation } from '@rranker/sdk/components/game-content/OverviewPageShell';
import { useGameData } from '@rranker/sdk/hooks/use-game-data';
import { resolveMaimaiCourseRank } from '../domain/maimai-course-rank';

export function presentOverview(bundle: GameDataBundle | undefined): OverviewPresentation {
  const payload = bundle?.payload;
  if (payload?.kind !== 'maimai') return {
    displayName: payload?.kind === 'empty' ? payload.displayName : '',

  };
  const rank = resolveMaimaiCourseRank(payload.player);
  return {
    displayName: payload.player.displayName,

    ratingCard: {
      themeOverride: resolveRatingTheme(payload.playerScore.value),
      label: payload.playerScore.label, display: payload.playerScore.display,
      meta: payload.bestSections.map(section => `${section.id.toUpperCase()} ${section.records.reduce((sum, record) => sum + record.rating, 0)}`).join(' · '),
      sideBadge: rank ? { title: '段位认定', value: rank.label } : undefined,
    },
  };
}

export function OverviewPage() {
  const query = useGameData();
  return <OverviewPageShell query={query} {...presentOverview(query.data)} />;
}
