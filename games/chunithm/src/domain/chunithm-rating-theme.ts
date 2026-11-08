import type { RatingTheme } from '@rranker/sdk';
import { RATING_PALETTES } from '@rranker/sdk/domain/rating-theme';
import { resolveTier } from '@rranker/sdk/domain/tier-theme';

export type ChunithmRatingTierId =
  | 'green'
  | 'orange'
  | 'red'
  | 'purple'
  | 'bronze'
  | 'silver'
  | 'gold'
  | 'platinum'
  | 'rainbow';

export type ChunithmRatingTierTheme = {
  id: ChunithmRatingTierId;
  label: string;
  colors: readonly [string, ...string[]];
};

export type ChunithmPossessionId = 'none' | 'copper' | 'silver' | 'gold' | 'platinum' | 'rainbow';

type RatingTier = {
  min: number;
  theme: ChunithmRatingTierTheme;
};

const RATING_TIERS: readonly RatingTier[] = [
  { min: 0, theme: { id: 'green', label: '绿', colors: ['#00E676'] } },
  { min: 4, theme: { id: 'orange', label: '橙', colors: ['#FF8A00'] } },
  { min: 7, theme: { id: 'red', label: '红', colors: ['#FF2D55'] } },
  { min: 10, theme: { id: 'purple', label: '紫', colors: ['#B845FF'] } },
  { min: 12, theme: { id: 'bronze', label: '铜', colors: ['#D67A31'] } },
  { min: 13.25, theme: { id: 'silver', label: '银', colors: ['#B8D7E8'] } },
  { min: 14.5, theme: { id: 'gold', label: '金', colors: ['#FFD84D'] } },
  { min: 15.25, theme: { id: 'platinum', label: '铂金', colors: ['#8DEBFF'] } },
  {
    min: 16,
    theme: {
      id: 'rainbow',
      label: '虹',
      colors: ['#FF2D95', '#FF6B00', '#FFF200', '#00F5A0', '#00C2FF', '#7A5CFF'],
    },
  },
];

const POSSESSION_PALETTES = {
  none: RATING_PALETTES.white, copper: RATING_PALETTES.bronze, silver: RATING_PALETTES.silver,
  gold: RATING_PALETTES.gold, platinum: RATING_PALETTES.platinum, rainbow: RATING_PALETTES.rainbow,
};

const POSSESSION_LABELS: Record<ChunithmPossessionId, string> = {
  none: '无领域',
  copper: '铜领域',
  silver: '银领域',
  gold: '金领域',
  platinum: '铂金领域',
  rainbow: '虹领域',
};

export function resolveChunithmRatingTier(rating: number): ChunithmRatingTierTheme {
  const value = Number.isFinite(rating) ? Math.max(0, rating) : 0;
  return resolveTier(RATING_TIERS, value);
}

export function resolveChunithmRatingTierBorder(rating: number): {
  borderColors: readonly [string, string, ...string[]];
  borderLocations: readonly [number, number, ...number[]];
} {
  const colors = resolveChunithmRatingTier(rating).colors;
  if (colors.length === 1) {
    const color = colors[0]!;
    return { borderColors: [color, color], borderLocations: [0, 1] };
  }
  const stops = colors.map((_, index) => index / (colors.length - 1));
  return {
    borderColors: colors as readonly [string, string, ...string[]],
    borderLocations: stops as unknown as readonly [number, number, ...number[]],
  };
}

export function resolveChunithmRatingCardTheme(
  rating: number | null,
  ratingPossession: string | null | undefined,
): RatingTheme {
  const possession = resolveChunithmPossessionTheme(ratingPossession);
  if (rating == null) return possession;
  const border = resolveChunithmRatingTierBorder(rating);
  return {
    ...possession,
    borderColors: border.borderColors,
    borderLocations: border.borderLocations,
  };
}

export function normalizeChunithmPossession(value: string | null | undefined): ChunithmPossessionId {
  const normalized = value?.trim().toLowerCase();
  if (normalized === 'platina') return 'platinum';
  return normalized === 'copper'
    || normalized === 'silver'
    || normalized === 'gold'
    || normalized === 'platinum'
    || normalized === 'rainbow'
    ? normalized
    : 'none';
}

export function resolveChunithmPossessionTheme(
  value: string | null | undefined,
): RatingTheme {
  const id = normalizeChunithmPossession(value);
  return {
    ...POSSESSION_PALETTES[id],
    id: `chunithm-possession-${id}`,
    label: POSSESSION_LABELS[id],
    starCount: 0,
  };
}

export const CHUNITHM_RATING_TIER_MINS = RATING_TIERS.map((tier) => tier.min);
