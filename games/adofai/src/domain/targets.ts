import type { DetailParams, GameId, LibraryTarget, SongLibraryTarget } from '@rranker/sdk';

export function tufSongTarget(value: string | number): SongLibraryTarget {
  const songId = String(value);
  return { gameId: 'adofai', kind: 'song', id: songId, target: { songId } };
}

export function parseDetailParams(gameId: GameId, params: DetailParams): DetailParams | null {
  if (gameId !== 'adofai' || !params.songId?.trim()) return null;
  if (Object.keys(params).some(key => !["songId"].includes(key))) return null;
  return { ...params, songId: params.songId.trim() };
}

export function parseLibraryTarget(value: LibraryTarget): LibraryTarget | null {
  const params = parseDetailParams(value.gameId, value.target);
  if (!params) return null;
  if (value.kind === 'song') {
    if (Object.keys(params).some(key => key !== 'songId')) return null;
    const target = tufSongTarget(params.songId);
    return target.id === value.id ? target : null;
  }
  return null;
}
