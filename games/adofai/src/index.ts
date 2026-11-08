import type { GameAdapter } from '@rranker/sdk';
import adofaiIcon from './assets/adofai.webp';

export const gameIds = ["adofai"] as const;


export const adapter = { kind: 'game', id: 'game.adofai', title: "冰与火之舞", games: [
{ id: 'adofai', accountOrder: 4, title: '冰与火之舞', icon: adofaiIcon, profile: { ratingLabel: 'RANKED SCORE', ratingDigits: 0, bestSections: [{ id: 'top20', title: 'Top 20 Impact', size: 20 }] } }
] } satisfies GameAdapter;
