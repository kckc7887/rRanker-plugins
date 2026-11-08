import { TintedRatingTag } from '@rranker/sdk/components/TintedRatingTag';
import type { BoundAccount } from '@rranker/sdk/account';
import type { RatingTheme } from '@rranker/sdk';
import type { TufPlayer } from '@rranker/game-adofai/domain/tuf';

export const TUF_RATING_THEME: RatingTheme = {
  id: 'tuf', label: 'TUF',
  fillColors: ['#45C9F4', '#6977B8', '#F15B55'], fillLocations: [0, 0.5, 1],
  borderColors: ['#209FCB', '#8A5A91', '#C53E3B'], borderLocations: [0, 0.5, 1],
  overlayColor: 'rgba(10, 22, 38, 0.18)', textColor: '#FFFFFF', starColor: '#FFFFFF', starCount: 0,
};

export function formatTufOverviewRatingMeta(player: TufPlayer): string {
  const rank = player.globalRank ?? player.rank;
  return `世界排名 ${rank ? `#${rank}` : '—'} · ${player.totalPasses} 条公开成绩`;
}

export function formatTufRankBadge(player: TufPlayer): string {
  const rank = player.globalRank ?? player.rank;
  return rank ? `#${rank}` : '—';
}

export function AccountRating({ account }: { account: BoundAccount }) {
  return <TintedRatingTag theme={TUF_RATING_THEME} display={account.scoreDisplay} accessibilityLabel={'RANKED SCORE ' + account.scoreDisplay} testID="tuf-rating-tag" />;
}
