import { memo } from 'react';
import { GameSongRow, SongRowBadges } from '@rranker/sdk/components/game-content/GameSongRow';
import { rizlineCoverUrl, sortedRizlineCharts, type RizlineSong } from '@rranker/game-rizline/domain/rizline';
import { presentRizlineSong } from '@rranker/game-rizline/presentation';
import { useAppTheme } from '@rranker/sdk/theme/app-theme';
import { RizlineDifficultyBadge } from '@rranker/game-rizline/components/RizlineScoreVisuals';

export const RizlineSongRow = memo(function RizlineSongRow({ song, favorite = false, favoritePending = false, onFavoriteChange }: {
  song: RizlineSong; favorite?: boolean; favoritePending?: boolean; onFavoriteChange?: (songId: string, favorite: boolean) => void;
}) {
  const theme = useAppTheme();
  return <GameSongRow presentation={presentRizlineSong(song)} coverSource={rizlineCoverUrl(song)}
    coverLabel="曲绘" placeholderColor={theme.input} favorite={favorite} favoritePending={favoritePending} onFavoriteChange={onFavoriteChange ? value => onFavoriteChange(song.id, value) : undefined}
    badges={<SongRowBadges>{sortedRizlineCharts(song.charts).map((chart) =>
      <RizlineDifficultyBadge key={chart.id} difficulty={chart.difficulty} constant={chart.constant} showLabel={false} />)}</SongRowBadges>} />;
});
