import type { DetailParams, GameId, LibraryTarget, SongLibraryTarget, ChartLibraryTarget } from '@rranker/sdk';

export function osuSongTarget(gameId: GameId, value: string | number): SongLibraryTarget {
  const songId = String(value);
  return { gameId, kind: 'song', id: songId, target: { songId } };
}

export function osuChartTarget(gameId: GameId, value: string | number, beatmapId: number): ChartLibraryTarget {
  const songId = String(value);
  return { gameId, kind: 'chart', id: String(beatmapId), target: { songId, beatmapId: String(beatmapId) } };
}

export function parseDetailParams(gameId: GameId, params: DetailParams): DetailParams | null {
  if (!['osu-standard', 'osu-mania', 'osu-catch', 'osu-taiko'].includes(gameId) || !params.songId?.trim()) return null;
  if (Object.keys(params).some(key => !["songId", "beatmapId", "scoreId"].includes(key))) return null;
  for (const key of ["beatmapId", "scoreId"]) {
    const value = params[key];
    if (value !== undefined && (!/^\d+$/u.test(value) || !Number.isSafeInteger(Number(value)))) return null;
  }
  return { ...params, songId: params.songId.trim() };
}

export function parseLibraryTarget(value: LibraryTarget): LibraryTarget | null {
  const params = parseDetailParams(value.gameId, value.target);
  if (!params) return null;
  if (value.kind === 'song') {
    if (Object.keys(params).some(key => key !== 'songId')) return null;
    const target = osuSongTarget(value.gameId, params.songId);
    return target.id === value.id ? target : null;
  }
  if (params.beatmapId === undefined || params.scoreId !== undefined) return null;
  const target = osuChartTarget(value.gameId, params.songId, Number(params.beatmapId));
  return target.id === value.id ? target : null;
}
