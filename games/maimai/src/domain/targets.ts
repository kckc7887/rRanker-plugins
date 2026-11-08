import type { DetailParams, GameId, LibraryTarget, SongLibraryTarget, ChartLibraryTarget } from '@rranker/sdk';
import { difficultyFromIndex, normalizeSongId } from '@rranker/game-maimai/domain/catalog';

export function maimaiSongTarget(value: string | number): SongLibraryTarget {
  const songId = normalizeSongId(value);
  return { gameId: 'maimai', kind: 'song', id: songId, target: { songId } };
}

export function maimaiChartTarget(value: string | number, chartType: import('@rranker/game-maimai/domain/models').ChartType, levelIndex: number): ChartLibraryTarget {
  const songId = normalizeSongId(value);
  return { gameId: 'maimai', kind: 'chart', id: JSON.stringify([songId, chartType, levelIndex]),
    target: { songId, chartType, levelIndex: String(levelIndex) } };
}

export function parseDetailParams(gameId: GameId, params: DetailParams): DetailParams | null {
  if (gameId !== 'maimai' || !params.songId?.trim()) return null;
  if (Object.keys(params).some(key => !["songId", "chartType", "levelIndex"].includes(key))) return null;
  const levelIndex = params.levelIndex;
  if (levelIndex !== undefined && (!/^\d+$/u.test(levelIndex) || !Number.isSafeInteger(Number(levelIndex))
    || (params.chartType === 'UTAGE' ? Number(levelIndex) !== 0 : difficultyFromIndex(Number(levelIndex)) === 'unknown'))) return null;
  if (params.chartType !== undefined && !['SD', 'DX', 'UTAGE'].includes(params.chartType)) return null;
  return { ...params, songId: params.songId.trim() };
}

export function parseLibraryTarget(value: LibraryTarget): LibraryTarget | null {
  const params = parseDetailParams(value.gameId, value.target);
  if (!params) return null;
  if (value.kind === 'song') {
    if (Object.keys(params).some(key => key !== 'songId')) return null;
    const target = maimaiSongTarget(params.songId);
    return target.id === value.id ? target : null;
  }
  if (params.levelIndex === undefined || params.chartType === undefined) return null;
  const target = maimaiChartTarget(params.songId, params.chartType as 'SD' | 'DX' | 'UTAGE', Number(params.levelIndex));
  return target.id === value.id ? target : null;
}
