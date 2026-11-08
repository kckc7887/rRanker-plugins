import type { GameAdapter, RatingTheme } from '@rranker/sdk';
import appIcon from './assets/icon.png';

export const gameIds = ["example"] as const;

export const EXAMPLE_RATING_THEME: RatingTheme = {
  id: 'example', label: 'EXAMPLE RATING',
  fillColors: ['#3B82F6', '#8B5CF6', '#EC4899', '#F43F5E'], fillLocations: [0, 0.34, 0.67, 1],
  borderColors: ['#93C5FD', '#C4B5FD', '#F9A8D4', '#FDA4AF'], borderLocations: [0, 0.34, 0.67, 1],
  overlayColor: 'transparent', textColor: '#FFFFFF', starColor: '#FFFFFF', starCount: 0,
};
export const adapter = { kind: 'game', id: 'game.example', title: "示例游戏", games: [
{ id: 'example', title: '示例游戏', icon: appIcon, accountScoreTheme: EXAMPLE_RATING_THEME, fixture: true, profile: { ratingLabel: 'EXAMPLE RATING', ratingDigits: 0, bestSections: [{ id: 'best30', title: 'Best 30', size: 30 }, { id: 'ranked10', title: 'Ranked 10', size: 10 }] } }
] } satisfies GameAdapter;
