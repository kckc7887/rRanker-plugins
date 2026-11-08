import { UserLibraryList } from '@rranker/sdk/components/game-content/UserLibraryList';
import { useUserLibrary } from '@rranker/sdk/hooks/use-user-library';
import { useMemo } from 'react';
import type { PluginPageProps } from '@rranker/sdk';
import type { OsuGameId } from '../index';
import { useOsuBeatmapsetsByIds } from '../hooks/use-osu-beatmapsets-by-ids';

export function LibraryPage({ gameId }: PluginPageProps) {
  const library = useUserLibrary();
  const ids = useMemo(() => [...new Set((library.data ?? []).map(item => item.target.songId))], [library.data]);
  const songs = useOsuBeatmapsetsByIds(gameId as OsuGameId, ids).data;
  return <UserLibraryList library={library} present={item => {
    const song = songs.get(item.target.songId);
    const chart = song?.beatmaps.find(value => value.id === Number(item.target.beatmapId));
    return { title: song?.title ?? `歌曲 ID ${item.target.songId}`, chartLabel: chart ? `${chart.version} · ${chart.difficultyRating.toFixed(2)}★` : `难度 ${item.target.beatmapId}`, cover: song?.cover, available: !!song };
  }} />;
}
