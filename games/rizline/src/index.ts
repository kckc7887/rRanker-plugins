import type { GameAdapter, RatingTheme } from '@rranker/sdk';
import rizlineIcon from './assets/rizline.png';

export const gameIds = ["rizline"] as const;

export const RIZLINE_RATING_THEME: RatingTheme = {
  id: 'rizline', label: 'Rizline', fillColors: ['#B5D9D0', '#94C5B8', '#7AB1A3'], fillLocations: [0, 0.52, 1],
  borderColors: ['#52796F', '#3B6157'], borderLocations: [0, 1], overlayColor: 'rgba(75,78,85,0.10)',
  textColor: '#263C36', starColor: '#3B6157', starCount: 0,
};
export const adapter = { kind: 'game', id: 'game.rizline', title: "Rizline", games: [
{ id: 'rizline', title: 'Rizline', icon: rizlineIcon, accountScoreTheme: RIZLINE_RATING_THEME, profile: { ratingLabel: 'Ranking Score', ratingDigits: 4, bestSections: [{ id: 'ah5', title: 'AH5（推定）', size: 5 }, { id: 'b35', title: 'Best35（推定）', size: 35 }] } }
] } satisfies GameAdapter;
