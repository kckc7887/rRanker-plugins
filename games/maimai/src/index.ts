import type { GameAdapter } from '@rranker/sdk';
import maimaiIcon from './assets/maimai-dx.webp';

export const gameIds = ["maimai"] as const;


export const adapter = { kind: 'game', id: 'game.maimai', title: "舞萌 DX", games: [
{ id: 'maimai', accountOrder: 0, title: '舞萌 DX', icon: maimaiIcon, profile: { ratingLabel: 'DX RATING', ratingDigits: 5, bestSections: [
      { id: 'b35', title: '过往版本 Best35', size: 35 },
      { id: 'b15', title: '当前版本 Best15', size: 15 },
    ] } }
] } satisfies GameAdapter;
