import type { GameAdapter } from '@rranker/sdk';
import museDashIcon from './assets/musedash.webp';

export const gameIds = ["musedash"] as const;


export const adapter = { kind: 'game', id: 'game.musedash', title: "喵斯快跑", games: [
{ id: 'musedash', accountOrder: 5, title: '喵斯快跑', icon: museDashIcon, profile: { ratingLabel: 'Rating', ratingDigits: 0, bestSections: [{ id: 'best30', title: 'Best 30', size: 30 }] } }
] } satisfies GameAdapter;
