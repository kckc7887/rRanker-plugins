import { UserLibraryList } from '@rranker/sdk/components/game-content/UserLibraryList';
import { useUserLibrary } from '@rranker/sdk/hooks/use-user-library';
import { useMuseDashAlbums } from '../hooks/use-muse-dash';
import { MUSE_DASH_DIFFICULTY_LABELS, museDashCoverUrl, museDashSongTitle } from '../domain/muse-dash';

export function LibraryPage() {
  const library = useUserLibrary();
  const albums = useMuseDashAlbums();
  const songs = new Map(Object.values(albums.data ?? {}).flatMap(album => Object.values(album.music).map(song => [song.uid, song] as const)));
  return <UserLibraryList library={library} present={item => {
    const song = songs.get(item.target.songId);
    return { title: song ? museDashSongTitle(song) : `歌曲 ID ${item.target.songId}`, chartLabel: MUSE_DASH_DIFFICULTY_LABELS[Number(item.target.levelIndex)] ?? '—', cover: song ? museDashCoverUrl(song.cover) : null, coverRadius: 29, available: !!song };
  }} />;
}
