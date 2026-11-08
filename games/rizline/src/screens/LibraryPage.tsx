import { UserLibraryList } from '@rranker/sdk/components/game-content/UserLibraryList';
import { useUserLibrary } from '@rranker/sdk/hooks/use-user-library';
import { useRizlineCatalog } from '../hooks/use-rizline-catalog';
import { RIZLINE_DIFFICULTIES, rizlineCoverUrl, rizlineDifficultyIndex } from '../domain/rizline';

export function LibraryPage() {
  const library = useUserLibrary();
  const catalog = useRizlineCatalog();
  const songs = new Map(catalog.data?.snapshot.songs.map(song => [song.id, song]));
  return <UserLibraryList library={library} present={item => {
    const song = songs.get(item.target.songId);
    const index = Number(item.target.levelIndex);
    const chart = song?.charts.find(value => rizlineDifficultyIndex(value.difficulty) === index);
    return { title: song?.title ?? `歌曲 ID ${item.target.songId}`, chartLabel: chart ? `${chart.difficulty} ${chart.level}` : RIZLINE_DIFFICULTIES[index] ?? '—', cover: song ? rizlineCoverUrl(song) : null, available: !!song };
  }} />;
}
