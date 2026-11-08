import type { GameAdapter } from '@rranker/sdk';
import phigrosIcon from './assets/phigros.webp';

export const gameIds = ["phigros"] as const;


export const adapter = { kind: 'game', id: 'game.phigros', title: "Phigros", games: [
{ id: 'phigros', accountOrder: 2, title: 'Phigros', icon: phigrosIcon, profile: { ratingLabel: 'RKS', ratingDigits: 4, bestSections: [
      { id: 'phi3', title: 'Phi3', size: 3 },
      { id: 'b27', title: 'Best27', size: 27 },
    ] } }
] } satisfies GameAdapter;
