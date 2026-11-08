import type { RatingTheme } from '@rranker/sdk';
import { RATING_PALETTES } from '@rranker/sdk/domain/rating-theme';
import { resolveTier } from '@rranker/sdk/domain/tier-theme';

type Tier = { min: number; theme: Omit<RatingTheme, 'starCount'> };
const TIERS: readonly Tier[] = [
{ min: 0, theme: { ...RATING_PALETTES.white, id: 'white', label: '白 · 0–999' } },
{ min: 1000, theme: { ...RATING_PALETTES.blue, id: 'blue', label: '青 · 1000–1999' } },
{ min: 2000, theme: { ...RATING_PALETTES.green, id: 'green', label: '绿 · 2000–3999' } },
{ min: 4000, theme: { ...RATING_PALETTES.yellow, id: 'yellow', label: '黄 · 4000–6999' } },
{ min: 7000, theme: { ...RATING_PALETTES.red, id: 'red', label: '赤 · 7000–9999' } },
{ min: 10000, theme: { ...RATING_PALETTES.purple, id: 'purple', label: '紫 · 10000–11999' } },
{ min: 12000, theme: { ...RATING_PALETTES.bronze, id: 'bronze', label: '铜 · 12000–12999' } },
{ min: 13000, theme: { ...RATING_PALETTES.silver, id: 'silver', label: '银 · 13000–13999' } },
{ min: 14000, theme: { ...RATING_PALETTES.gold, id: 'gold', label: '金 · 14000–14499' } },
{ min: 14500, theme: { ...RATING_PALETTES.platinum, id: 'platinum', label: '白金 · 14500–14999' } },
{ min: 15000, theme: { ...RATING_PALETTES.rainbow, id: 'rainbow', label: '彩 · 15000–15999' } },
{ min: 16000, theme: { ...RATING_PALETTES.extreme, id: 'extreme', label: '彩极 · 16000+' } }
];

function starCountFor(value: number): number {
  if (value < 14000) return 0;
  if (value < 14500) return Math.min(2, Math.floor((value - 14000) / 250) + 1);
  if (value < 15000) return Math.min(2, Math.floor((value - 14500) / 250) + 1);
  if (value < 16000) return Math.min(4, Math.floor((value - 15000) / 250) + 1);
  return Math.min(4, Math.floor((value - 16000) / 250) + 1);
}

export function resolveRatingTheme(rating: number): RatingTheme {
  const value = Number.isFinite(rating) ? Math.max(0, Math.floor(rating)) : 0;
  const theme = resolveTier(TIERS, value);
  return { ...theme, starCount: starCountFor(value) };
}

export const DX_RATING_TIER_MINS = TIERS.map((tier) => tier.min);
