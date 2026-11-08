import type { GameAdapter } from '@rranker/sdk';
import osuStandardIcon from './assets/osu-standard.webp';
import osuIcon from './assets/osu.png';
import osuManiaIcon from './assets/osu-mania.webp';
import osuCatchIcon from './assets/osu-catch.webp';
import osuTaikoIcon from './assets/osu-taiko.webp';

export const gameIds = ["osu-standard","osu-mania","osu-catch","osu-taiko"] as const;
export const OSU_MODE_GAME_IDS = gameIds;
export type OsuModeGameId = typeof gameIds[number];
export type OsuGameId = OsuModeGameId;
export const OSU_FAMILY = { id: 'osu', title: 'osu!', modeGameIds: gameIds };
export function isOsuGameId(gameId: string): gameId is OsuGameId { return (gameIds as readonly string[]).includes(gameId); }


export const adapter = { kind: 'game', id: 'game.osu', title: "osu!", games: [
{ id: 'osu-standard', accountOrder: 6, title: 'osu!standard', icon: osuStandardIcon, familyId: 'osu', familyIcon: osuIcon, profile: { ratingLabel: 'PP', ratingDigits: 0, bestSections: [{ id: 'top100', title: 'Top 100', size: 100 }] } },
{ id: 'osu-mania', accountOrder: 7, title: 'osu!mania', icon: osuManiaIcon, familyId: 'osu', hiddenInPicker: true, profile: { ratingLabel: 'PP', ratingDigits: 0, bestSections: [{ id: 'top100', title: 'Top 100', size: 100 }] } },
{ id: 'osu-catch', accountOrder: 8, title: 'osu!catch', icon: osuCatchIcon, familyId: 'osu', hiddenInPicker: true, profile: { ratingLabel: 'PP', ratingDigits: 0, bestSections: [{ id: 'top100', title: 'Top 100', size: 100 }] } },
{ id: 'osu-taiko', accountOrder: 9, title: 'osu!taiko', icon: osuTaikoIcon, familyId: 'osu', hiddenInPicker: true, profile: { ratingLabel: 'PP', ratingDigits: 0, bestSections: [{ id: 'top100', title: 'Top 100', size: 100 }] } }
], families: [OSU_FAMILY] } satisfies GameAdapter;
