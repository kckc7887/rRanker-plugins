import { UserLibraryList } from '@rranker/sdk/components/game-content/UserLibraryList';
import { useUserLibrary } from '@rranker/sdk/hooks/use-user-library';
import { useMemo } from 'react';
import { useTufLibraryLevels } from '../hooks/use-tuf';

export function LibraryPage() {
  const library = useUserLibrary();
  const ids = useMemo(() => [...new Set((library.data ?? []).map(item => Number(item.target.songId)))].filter(id => Number.isSafeInteger(id) && id > 0), [library.data]);
  const results = useTufLibraryLevels(ids);
  const songs = new Map(results.flatMap(query => query.data ? [[String(query.data.level.id), query.data.level] as const] : []));
  return <UserLibraryList library={library} present={item => {
    const song = songs.get(item.target.songId);
    return { title: song?.song ?? `歌曲 ID ${item.target.songId}`, available: !!song };
  }} />;
}
