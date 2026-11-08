import type { GameAdapter, RatingTheme } from '@rranker/sdk';
import majdataIcon from './assets/majdata.png';

export const gameIds = ["majdata-net"] as const;

export const NEUTRAL_RATING_THEME: RatingTheme = {
  id: 'empty', label: 'empty',
  fillColors: ['#2A3140', '#1A1F2A'], fillLocations: [0, 1],
  borderColors: ['#596273', '#303745'], borderLocations: [0, 1],
  overlayColor: 'transparent', textColor: '#FFFFFF', starColor: '#CBD5E1', starCount: 0,
};
export const adapter = { kind: 'game', id: 'game.majdata-net', title: "Majdata Net", games: [
{ id: 'majdata-net', title: 'Majdata Net', icon: majdataIcon, accountScoreTheme: NEUTRAL_RATING_THEME, profile: { ratingLabel: 'DX · Classic', ratingDigits: 4, bestSections: [{ id: 'recent', title: 'Recent', size: 0 }] } }
] } satisfies GameAdapter;
