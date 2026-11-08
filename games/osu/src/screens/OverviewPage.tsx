import type { GameDataBundle } from '@rranker/sdk/data';
import { OverviewPageShell, type OverviewPresentation } from '@rranker/sdk/components/game-content/OverviewPageShell';
import { useGameData } from '@rranker/sdk/hooks/use-game-data';
import { OSU_PP_RATING_THEME } from '../components/OsuRatingTag';
import { formatOsuPlayTime } from '../domain/osu';

export function presentOverview(bundle: GameDataBundle | undefined): OverviewPresentation {
  const payload = bundle?.payload;
  if (payload?.kind !== 'osu') return {
    displayName: payload?.kind === 'empty' ? payload.displayName : '',

  };

  return {
    displayName: payload.player.username,

    ratingCard: {
      label: payload.playerScore.label, display: payload.playerScore.display,
      meta: formatOsuPlayTime(payload.player.playTimeSeconds), themeOverride: OSU_PP_RATING_THEME,
    },
  };
}

export function OverviewPage() {
  const query = useGameData();
  return <OverviewPageShell query={query} {...presentOverview(query.data)} />;
}
