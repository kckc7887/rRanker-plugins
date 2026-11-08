import type { GameDataBundle } from '@rranker/sdk/data';
import { OverviewPageShell, type OverviewPresentation } from '@rranker/sdk/components/game-content/OverviewPageShell';
import { useGameData } from '@rranker/sdk/hooks/use-game-data';
import { resolveChunithmRatingCardTheme, resolveChunithmRatingTier } from '../domain/chunithm-rating-theme';
import { averageChunithmRating } from '../domain/chunithm-score-presentation';

export function presentOverview(bundle: GameDataBundle | undefined): OverviewPresentation {
  const payload = bundle?.payload;
  if (payload?.kind !== 'chunithm') return {
    displayName: payload?.kind === 'empty' ? payload.displayName : '',
    ratingCard: bundle ? { label: bundle.profile.ratingLabel, display: '—', meta: '请绑定落雪账号' } : undefined,
  };
  const best30 = payload.bestSections.find(section => section.id === 'b30');
  const new20 = payload.bestSections.find(section => section.id === 'new20');
  return {
    displayName: payload.player?.name ?? '落雪账号（待同步）',

    ratingCard: {
      label: payload.playerScore.label, display: payload.playerScore.display,
      borderless: !payload.hasSyncedData,
      meta: `Best30 ${averageChunithmRating(best30?.scores ?? [])} · New20 ${averageChunithmRating(new20?.scores ?? [])}`,
      themeOverride: resolveChunithmRatingCardTheme(payload.hasSyncedData ? payload.playerScore.value : null, payload.player?.rating_possession),
      valueTheme: payload.hasSyncedData ? resolveChunithmRatingTier(payload.playerScore.value) : undefined,
    },
  };
}

export function OverviewPage() {
  const query = useGameData();
  return <OverviewPageShell query={query} {...presentOverview(query.data)} />;
}
