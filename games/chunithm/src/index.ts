import type { GameAdapter } from '@rranker/sdk';
import chunithmIcon from './assets/chunithm.webp';

export const gameIds = ["chunithm"] as const;


export const adapter = { kind: 'game', id: 'game.chunithm', title: "中二节奏", games: [
{ id: 'chunithm', accountOrder: 1, title: '中二节奏', icon: chunithmIcon, profile: { ratingLabel: 'RATING', ratingDigits: 0, bestSections: [] } }
] } satisfies GameAdapter;
