import { UserLibraryList } from '@rranker/sdk/components/game-content/UserLibraryList';
import { useUserLibrary } from '@rranker/sdk/hooks/use-user-library';
import { useChunithmCatalog } from '../hooks/use-chunithm-catalog';
import { chunithmJacketUrl } from '../components/ChunithmSongRow';
import { CHUNITHM_DIFFICULTY_LABELS } from '../domain/chunithm';

export function LibraryPage() {
  const library = useUserLibrary();
  const catalog = useChunithmCatalog();
  const songs = new Map(catalog.data?.songs.map(song => [String(song.id), song]));
  return <UserLibraryList library={library} present={item => {
    const song = songs.get(item.target.songId);
    const chart = song?.difficulties.find(value => value.difficulty === Number(item.target.levelIndex));
    return { title: song?.title ?? `歌曲 ID ${item.target.songId}`, chartLabel: chart ? CHUNITHM_DIFFICULTY_LABELS[chart.difficulty] : `难度 ${item.target.levelIndex}`, cover: song ? chunithmJacketUrl(song) : null, available: !!song };
  }} />;
}
