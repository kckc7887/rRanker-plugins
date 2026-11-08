import { UserLibraryList } from '@rranker/sdk/components/game-content/UserLibraryList';
import { useUserLibrary } from '@rranker/sdk/hooks/use-user-library';
import { useMemo } from 'react';
import { usePhiraChartsByIds } from '../hooks/use-phira';

export function LibraryPage() {
  const library = useUserLibrary();
  const ids = useMemo(() => [...new Set((library.data ?? []).filter(item => item.kind === 'song' && /^\d+$/.test(item.target.songId)).map(item => Number(item.target.songId)))], [library.data]);
  const charts = usePhiraChartsByIds(ids);
  const songs = new Map(charts.data?.map(chart => [String(chart.id), chart]));
  return <UserLibraryList library={library} present={item => {
    const song = songs.get(item.target.songId);
    return { title: song?.name ?? `歌曲 ID ${item.target.songId}`, cover: song?.illustration, available: !!song };
  }} />;
}
