import type { DetailParams, GameId, LibraryTarget, SongLibraryTarget, ChartLibraryTarget } from '@rranker/sdk';
import { CHUNITHM_DIFFICULTY_LABELS } from '@rranker/game-chunithm/domain/chunithm';

export function chunithmSongTarget(value: string | number): SongLibraryTarget {
  const songId = String(value);
  return { gameId: 'chunithm', kind: 'song', id: songId, target: { songId } };
}

export function chunithmChartTarget(value: string | number, levelIndex: number): ChartLibraryTarget {
  const songId = String(value);
  return { gameId: 'chunithm', kind: 'chart', id: JSON.stringify([songId, levelIndex]),
    target: { songId, levelIndex: String(levelIndex) } };
}

export function parseDetailParams(gameId: GameId, params: DetailParams): DetailParams | null {
  if (gameId !== 'chunithm' || !params.songId?.trim()) return null;
  if (Object.keys(params).some(key => !["songId", "levelIndex"].includes(key))) return null;
  const levelIndex = params.levelIndex;
  if (levelIndex !== undefined && (!/^\d+$/u.test(levelIndex) || !Number.isSafeInteger(Number(levelIndex))
    || !Object.hasOwn(CHUNITHM_DIFFICULTY_LABELS, Number(levelIndex)))) return null;
  return { ...params, songId: params.songId.trim() };
}

export function parseLibraryTarget(value: LibraryTarget): LibraryTarget | null {
  const params = parseDetailParams(value.gameId, value.target);
  if (!params) return null;
  if (value.kind === 'song') {
    if (Object.keys(params).some(key => key !== 'songId')) return null;
    const target = chunithmSongTarget(params.songId);
    return target.id === value.id ? target : null;
  }
  if (params.levelIndex === undefined) return null;
  const target = chunithmChartTarget(params.songId, Number(params.levelIndex));
  return target.id === value.id ? target : null;
}
