import type { GameAdapter } from '@rranker/sdk';
import phiraIcon from './assets/phira.webp';

export const gameIds = ["phira"] as const;


export const adapter = { kind: 'game', id: 'game.phira', title: "Phira", games: [
{ id: 'phira', accountOrder: 3, title: 'Phira', icon: phiraIcon, profile: { ratingLabel: 'Ranking Score', ratingDigits: 2, bestSections: [{ id: 'best20', title: 'Best20', size: 20 }] } }
] } satisfies GameAdapter;
