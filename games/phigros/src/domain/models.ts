import type { DataSource } from '@rranker/sdk/data';

export type ChartType = 'SD';
export type Difficulty =
  | 'basic'
  | 'advanced'
  | 'expert'
  | 'master'
  | 'remaster'
  | 'utage'
  | 'unknown';

export interface Player {
  id: string;
  displayName: string;
  rating: number;
  source: DataSource;
}

export interface Song {
  id: string;
  title: string;
  artist?: string;
  illustrator?: string;
  version: string;
  versionId?: number;
  bpm?: number;
  genre?: string;
  region?: string;
  rights?: string;
  aliases?: string[];
  locked?: boolean;
  disabled?: boolean;
  charts: Chart[];
}

export interface PhigrosChartNotes {
  tap: number;
  hold: number;
  drag: number;
  flick: number;
  block?: number;
  total: number;
}

export interface GameVersion {
  id: number;
  title: string;
}

export interface CatalogSnapshot {
  currentVersion: GameVersion;
  versions: GameVersion[];
  songs: Song[];
  chartVersionIndex: Record<string, number>;
  source: DataSource;
}

export interface Chart {
  songId: string;
  type: ChartType;
  levelIndex: number;
  level: string;
  difficulty: Difficulty;
  difficultyConstant: number;
  charter?: string;
  versionId?: number;
  notes?: PhigrosChartNotes;
}

export interface SongAlias {
  songId: string;
  aliases: string[];
}

export interface AliasSnapshot {
  aliases: SongAlias[];
  source: DataSource;
}

export interface ScoreRecord extends Chart {
  title: string;
  achievements: number;
  dxScore: number | null;
  rating: number;
  fc: string | null;
  fs: string | null;
  rate: string;
  version: string;
  rawDifficulty?: string;
  rawFc?: string;
  rawFs?: string;
  rawRate?: string;
  /** 缺失字段的占位值不代表真实成绩。 */
  incomplete?: boolean;
}
