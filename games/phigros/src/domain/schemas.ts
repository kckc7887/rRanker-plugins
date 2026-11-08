import { DataSourceSchema } from '@rranker/sdk/data-schema';
import { z } from 'zod';

export const PlayerSchema = z.object({
  id: z.string(), displayName: z.string(), rating: z.number().finite(),
  source: DataSourceSchema,
}).passthrough();
const count = z.number().int().nonnegative();
const chartSchema = z.object({
  songId: z.string(), type: z.literal('SD'), levelIndex: count, level: z.string(),
  difficulty: z.enum(['basic', 'advanced', 'expert', 'master', 'remaster', 'utage', 'unknown']),
  difficultyConstant: z.number().finite(), charter: z.string().optional(), versionId: z.number().finite().optional(),
  notes: z.object({ tap: count, hold: count, drag: count, flick: count, block: count.optional(), total: count }).optional(),
}).passthrough();
export const ScoreRecordSchema = chartSchema.extend({
  title: z.string(), achievements: z.number().finite(), dxScore: z.number().finite().nullable(), rating: z.number().finite(),
  fc: z.string().nullable(), fs: z.string().nullable(), rate: z.string(), version: z.string(),
  rawDifficulty: z.string().optional(), rawFc: z.string().optional(), rawFs: z.string().optional(), rawRate: z.string().optional(),
  incomplete: z.boolean().optional(),
});
