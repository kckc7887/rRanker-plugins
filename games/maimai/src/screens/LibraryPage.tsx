import { UserLibraryList } from '@rranker/sdk/components/game-content/UserLibraryList';
import { useUserLibrary } from '@rranker/sdk/hooks/use-user-library';
import { useDetailedCatalog } from '../hooks/use-detailed-catalog';
import { maimaiJacketUrl } from '../domain/maimai-assets';

export function LibraryPage() {
  const library = useUserLibrary();
  const catalog = useDetailedCatalog();
  const songs = new Map(catalog.data?.songs.map(song => [song.id, song]));
  return <UserLibraryList library={library} present={item => {
    const song = songs.get(item.target.songId);
    const chart = song?.charts.find(value => value.type === item.target.chartType && value.levelIndex === Number(item.target.levelIndex));
    return { title: song?.title ?? `歌曲 ID ${item.target.songId}`, chartLabel: chart ? `${chart.type} ${chart.difficulty.toUpperCase()}` : `${item.target.chartType ?? ''} 难度 ${item.target.levelIndex}`, cover: song ? maimaiJacketUrl(song.id) : null, available: !!song };
  }} />;
}
