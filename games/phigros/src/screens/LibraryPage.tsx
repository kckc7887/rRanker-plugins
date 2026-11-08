import { UserLibraryList } from '@rranker/sdk/components/game-content/UserLibraryList';
import { useUserLibrary } from '@rranker/sdk/hooks/use-user-library';
import { usePhigrosCatalog } from '../hooks/use-phigros-catalog';

export function LibraryPage() {
  const library = useUserLibrary();
  const catalog = usePhigrosCatalog();
  const songs = new Map(catalog.data?.snapshot.songs.map(song => [song.id, song]));
  return <UserLibraryList library={library} present={item => {
    const song = songs.get(item.target.songId);
    const chart = song?.charts.find(value => value.levelIndex === Number(item.target.levelIndex));
    return { title: song?.title ?? `歌曲 ID ${item.target.songId}`, chartLabel: chart?.level ?? `难度 ${item.target.levelIndex}`, cover: song ? catalog.data?.provider.getIllustrationBlurUrl(song.id) : null, available: !!song };
  }} />;
}
