import { z } from 'zod';
import { normalizeSimaiFc, normalizeSimaiFs } from '@rranker/sdk/domain/simai-score';
import type { ChartType, Difficulty, ScoreRecord } from '@rranker/game-maimai/domain/models';

function mapKnownFc(value: string | null | undefined): string | null {
  return normalizeSimaiFc(value);
}

function mapKnownFs(value: string | null | undefined): string | null {
  return normalizeSimaiFs(value);
}

function keepRawStatus(
  value: string | null | undefined,
  known: string | null,
): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed || known) return undefined;
  /** SYNC 不作为产品成就展示。 */
  if (trimmed.toLowerCase() === 'sync') return undefined;
  return trimmed;
}

const LEVEL_INDEX_DIFFICULTY: Difficulty[] = ['basic', 'advanced', 'expert', 'master', 'remaster'];

export const LxnsEnvelopeSchema = z.object({
  success: z.boolean(),
  code: z.number().optional(),
  message: z.string().nullable().optional(),
  data: z.unknown().optional(),
}).passthrough();

const LxnsPlayerCollectionSchema = z.object({
  id: z.number().int(),
  name: z.string().optional(),
  color: z.string().nullable().optional(),
}).passthrough();

export const LxnsPlayerSchema = z.object({
  name: z.string(),
  rating: z.number().int().nonnegative(),
  friend_code: z.union([z.number(), z.string()]),
  course_rank: z.number().int().nonnegative().optional(),
  class_rank: z.number().int().nonnegative().optional(),
  trophy: LxnsPlayerCollectionSchema.nullable().optional(),
  icon: LxnsPlayerCollectionSchema.nullable().optional(),
  name_plate: LxnsPlayerCollectionSchema.nullable().optional(),
  frame: LxnsPlayerCollectionSchema.nullable().optional(),
}).passthrough();

export const LxnsScoreSchema = z.object({
  id: z.union([z.number(), z.string()]),
  song_name: z.string().optional(),
  level: z.string().optional(),
  level_index: z.number().int().min(0),
  achievements: z.number().finite().min(0),
  fc: z.string().nullable().optional(),
  fs: z.string().nullable().optional(),
  dx_score: z.number().int().nonnegative().nullable(),
  dx_rating: z.number().finite().nonnegative().optional(),
  rate: z.string().optional(),
  type: z.enum(['standard', 'dx', 'utage']),
}).passthrough();

function mapLxnsSongType(type: string): ChartType {
  const normalized = type.toLowerCase();
  if (normalized === 'dx') return 'DX';
  if (normalized === 'standard') return 'SD';
  if (normalized === 'utage') return 'UTAGE';
  throw new TypeError(`不支持的舞萌谱面类型：${type}`);
}

export function mapLxnsScore(raw: z.infer<typeof LxnsScoreSchema>): ScoreRecord {
  const difficulty = raw.type === 'utage'
    ? 'utage'
    : LEVEL_INDEX_DIFFICULTY[raw.level_index] ?? 'unknown';
  const level = raw.level ?? String(raw.level_index);
  const title = raw.song_name;
  const ratingKnown = raw.type === 'utage' || raw.dx_rating !== undefined;
  const rateKnown = raw.rate !== undefined;
  const incomplete = title === undefined || !ratingKnown || !rateKnown;
  const rating = raw.type === 'utage'
    ? 0
    : raw.dx_rating !== undefined
    ? Math.floor(raw.dx_rating)
    : 0;
  const fc = mapKnownFc(raw.fc);
  const fs = mapKnownFs(raw.fs);
  return {
    songId: String(raw.id),
    title: title ?? '曲名缺失',
    incomplete: incomplete || undefined,
    type: mapLxnsSongType(raw.type),
    levelIndex: raw.level_index,
    level,
    difficulty,
    difficultyConstant: 0,
    achievements: raw.achievements,
    dxScore: raw.dx_score,
    rating,
    fc,
    fs,
    rate: raw.rate ?? '',
    version: 'unknown',
    rawDifficulty: difficulty === 'unknown' ? level : undefined,
    rawFc: keepRawStatus(raw.fc, fc),
    rawFs: keepRawStatus(raw.fs, fs),
    rawRate: raw.rate,
  };
}
