import { UserLibraryList } from '@rranker/sdk/components/game-content/UserLibraryList';
import { useUserLibrary } from '@rranker/sdk/hooks/use-user-library';
import { EXAMPLE_SONGS } from '../domain/example';

const songs = new Map(EXAMPLE_SONGS.map(song => [song.id, song]));

export function LibraryPage() {
  const library = useUserLibrary();
  return <UserLibraryList library={library} present={item => {
    const song = songs.get(item.target.songId);
    return { title: song?.title ?? `歌曲 ID ${item.target.songId}`, chartLabel: 'Insane 27.5', cover: song?.coverUrl, available: !!song };
  }} />;
}
