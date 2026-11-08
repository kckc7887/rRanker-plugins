import { z } from 'zod';
import { normalizeSimaiFc, normalizeSimaiFs } from '@rranker/sdk/domain/simai-score';
import type { Difficulty, ScoreRecord } from '@rranker/game-maimai/domain/models';
import { calculateChartRating } from '@rranker/game-maimai/domain/rating';

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

export const DivingFishRecordSchema = z.object({
  achievements: z.number().finite().min(0),
  ds: z.number().finite().nonnegative(),
  dxScore: z.number().int().nonnegative().nullable(),
  fc: z.string().nullable().optional(), fs: z.string().nullable().optional(),
  level: z.string(), level_index: z.number().int().min(0), level_label: z.string().optional(),
  ra: z.number().int().nonnegative().optional(), rate: z.string(),
  song_id: z.union([z.number(), z.string()]), title: z.string(), type: z.string(), version: z.string().optional(),
}).passthrough();

export const DivingFishRecordsResponseSchema = z.object({
  additional_rating: z.number().int().nonnegative().optional(),
  nickname: z.string().optional(), plate: z.string().optional(),
  rating: z.number().int().nonnegative().optional(),
  records: z.array(DivingFishRecordSchema), username: z.string().optional(),
}).passthrough();

const DIFFICULTIES: Record<string, Difficulty> = {
  basic: 'basic', advanced: 'advanced', expert: 'expert', master: 'master',
  're:master': 'remaster', remaster: 'remaster',
};

export function mapDivingFishRecord(raw: z.infer<typeof DivingFishRecordSchema>, verifiedVersion?: string): ScoreRecord {
  const rawDifficulty = raw.level_label?.toLowerCase() ?? '';
  const difficulty = DIFFICULTIES[rawDifficulty] ?? 'unknown';
  const fc = mapKnownFc(raw.fc);
  const fs = mapKnownFs(raw.fs);
  return {
    songId: String(raw.song_id), title: raw.title, type: raw.type.toUpperCase() === 'DX' ? 'DX' : 'SD',
    levelIndex: raw.level_index, level: raw.level, difficulty, difficultyConstant: raw.ds,
    achievements: raw.achievements, dxScore: raw.dxScore ?? null,
    rating: raw.ra ?? calculateChartRating(raw.ds, raw.achievements),
    fc, fs, rate: raw.rate,
    version: raw.version ?? verifiedVersion ?? 'unknown',
    rawDifficulty: difficulty === 'unknown' ? raw.level_label : undefined,
    rawFc: keepRawStatus(raw.fc, fc),
    rawFs: keepRawStatus(raw.fs, fs),
    rawRate: raw.rate,
  };
}
