import { DataSourceSchema } from '@rranker/sdk/data-schema';
import { z } from 'zod';
import type { ScoreSnapshot } from '@rranker/game-maimai/domain/models';
import { isUtageSongId } from '@rranker/game-maimai/domain/catalog';

export const PlayerSchema = z.object({
  id: z.string(), displayName: z.string(), rating: z.number().finite(),
  extension: z.object({ kind: z.literal('maimai'), courseRank: z.number().finite().optional() }).optional(),
  presentation: z.object({
    iconId: z.number().finite().optional(), namePlateId: z.number().finite().optional(), frameId: z.number().finite().optional(),
    trophyName: z.string().optional(), trophyColor: z.string().nullable().optional(),
  }).optional(), source: DataSourceSchema,
}).passthrough();

const count = z.number().int().nonnegative();

const notes = z.object({ tap: count, hold: count, slide: count, touch: count, break: count, total: count });

const chartSchema = z.object({
  songId: z.string(), type: z.enum(['SD', 'DX', 'UTAGE']), levelIndex: count, level: z.string(),
  difficulty: z.enum(['basic', 'advanced', 'expert', 'master', 'remaster', 'utage', 'unknown']),
  difficultyConstant: z.number().finite(), charter: z.string().optional(), versionId: z.number().finite().optional(),
  notes: z.union([notes, z.object({ left: notes, right: notes })]).optional(),
  utage: z.object({ kanji: z.string().optional(), description: z.string().optional(), isBuddy: z.boolean() }).optional(),
}).passthrough();

export const ScoreRecordSchema = chartSchema.extend({
  title: z.string(), achievements: z.number().finite(), dxScore: z.number().finite().nullable(), rating: z.number().finite(),
  fc: z.string().nullable(), fs: z.string().nullable(), rate: z.string(), version: z.string(),
  rawDifficulty: z.string().optional(), rawFc: z.string().optional(), rawFs: z.string().optional(), rawRate: z.string().optional(),
  incomplete: z.boolean().optional(),
});

const versionSchema = z.object({ id: z.number().finite(), title: z.string() });

export const ScoreSnapshotSchema: z.ZodType<ScoreSnapshot> = z.object({
  player: PlayerSchema, records: z.array(ScoreRecordSchema), source: DataSourceSchema, catalogSource: DataSourceSchema,
  best50: z.object({
    player: PlayerSchema, currentVersion: versionSchema, b35: z.array(ScoreRecordSchema), b15: z.array(ScoreRecordSchema),
    unmatchedRecordCount: count, rating: z.number().finite(), generatedAt: z.string(), source: DataSourceSchema,
  }).passthrough(),
}).passthrough().refine(snapshot => (
  snapshot.records.every(record => !isUtageSongId(record.songId) || record.type === 'UTAGE')
  && [...snapshot.best50.b35, ...snapshot.best50.b15]
    .every(record => !isUtageSongId(record.songId) && record.type !== 'UTAGE')
), { message: '不支持的宴谱成绩结构' });
