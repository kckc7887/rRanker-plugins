import { UserLibraryList } from '@rranker/sdk/components/game-content/UserLibraryList';
import { useUserLibrary } from '@rranker/sdk/hooks/use-user-library';
import { useMemo } from 'react';
import { useMajdataLibrarySongs } from '../hooks/use-majdata';
import { MAJDATA_NAMES, majdataAsset } from '../domain/majdata';

export function LibraryPage() {
  const library = useUserLibrary();
  const ids = useMemo(() => [...new Set((library.data ?? []).map(item => item.target.songId))], [library.data]);
  const results = useMajdataLibrarySongs(ids);
  const songs = new Map(results.flatMap(query => query.data ? [[query.data.id, query.data] as const] : []));
  return <UserLibraryList library={library} present={item => {
    const song = songs.get(item.target.songId);
    const index = Number(item.target.levelIndex);
    return { title: song?.title ?? `歌曲 ID ${item.target.songId}`, chartLabel: `${MAJDATA_NAMES[index]} ${song?.levels[index] ?? ''}`, cover: song ? majdataAsset(song.id, 'image') : null, available: !!song };
  }} />;
}
