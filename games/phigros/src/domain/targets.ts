import type { DetailParams, GameId, LibraryTarget, SongLibraryTarget, ChartLibraryTarget } from '@rranker/sdk';
import { LEVEL_NAMES } from '@rranker/game-phigros/domain/phigros';

export function phigrosSongTarget(value: string | number): SongLibraryTarget {
  const songId = String(value);
  return { gameId: 'phigros', kind: 'song', id: songId, target: { songId } };
}

export function phigrosChartTarget(value: string | number, levelIndex: number): ChartLibraryTarget {
  const songId = String(value);
  return { gameId: 'phigros', kind: 'chart', id: JSON.stringify([songId, levelIndex]),
    target: { songId, levelIndex: String(levelIndex) } };
}

export function parseDetailParams(gameId: GameId, params: DetailParams): DetailParams | null {
  if (gameId !== 'phigros' || !params.songId?.trim()) return null;
  if (Object.keys(params).some(key => !["songId", "levelIndex"].includes(key))) return null;
  const levelIndex = params.levelIndex;
  if (levelIndex !== undefined && (!/^\d+$/u.test(levelIndex) || !Number.isSafeInteger(Number(levelIndex))
    || !Object.hasOwn(LEVEL_NAMES, Number(levelIndex)))) return null;
  return { ...params, songId: params.songId.trim() };
}

export function parseLibraryTarget(value: LibraryTarget): LibraryTarget | null {
  const params = parseDetailParams(value.gameId, value.target);
  if (!params) return null;
  if (value.kind === 'song') {
    if (Object.keys(params).some(key => key !== 'songId')) return null;
    const target = phigrosSongTarget(params.songId);
    return target.id === value.id ? target : null;
  }
  if (params.levelIndex === undefined) return null;
  const target = phigrosChartTarget(params.songId, Number(params.levelIndex));
  return target.id === value.id ? target : null;
}
