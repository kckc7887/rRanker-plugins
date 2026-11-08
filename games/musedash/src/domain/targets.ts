import type { DetailParams, GameId, LibraryTarget, SongLibraryTarget, ChartLibraryTarget } from '@rranker/sdk';
import { MUSE_DASH_DIFFICULTY_LABELS } from '@rranker/game-musedash/domain/muse-dash';

export function museDashSongTarget(value: string | number): SongLibraryTarget {
  const songId = String(value);
  return { gameId: 'musedash', kind: 'song', id: songId, target: { songId } };
}

export function museDashChartTarget(value: string | number, levelIndex: number): ChartLibraryTarget {
  const songId = String(value);
  return { gameId: 'musedash', kind: 'chart', id: JSON.stringify([songId, levelIndex]),
    target: { songId, levelIndex: String(levelIndex) } };
}

export function parseDetailParams(gameId: GameId, params: DetailParams): DetailParams | null {
  if (gameId !== 'musedash' || !params.songId?.trim()) return null;
  if (Object.keys(params).some(key => !["songId", "levelIndex"].includes(key))) return null;
  const levelIndex = params.levelIndex;
  if (levelIndex !== undefined && (!/^\d+$/u.test(levelIndex) || !Number.isSafeInteger(Number(levelIndex))
    || Number(levelIndex) >= MUSE_DASH_DIFFICULTY_LABELS.length)) return null;
  return { ...params, songId: params.songId.trim() };
}

export function parseLibraryTarget(value: LibraryTarget): LibraryTarget | null {
  const params = parseDetailParams(value.gameId, value.target);
  if (!params) return null;
  if (value.kind === 'song') {
    if (Object.keys(params).some(key => key !== 'songId')) return null;
    const target = museDashSongTarget(params.songId);
    return target.id === value.id ? target : null;
  }
  if (params.levelIndex === undefined) return null;
  const target = museDashChartTarget(params.songId, Number(params.levelIndex));
  return target.id === value.id ? target : null;
}
