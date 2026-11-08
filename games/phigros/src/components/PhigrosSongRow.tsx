import { memo } from 'react';
import { GameSongRow, SongRowBadges } from '@rranker/sdk/components/game-content/GameSongRow';
import { PhigrosDifficultyBadge } from '@rranker/game-phigros/components/PhigrosDifficultyBadge';
import type { Song } from '@rranker/game-phigros/domain/models';
import { presentPhigrosSong } from '@rranker/game-phigros/presentation';
import { useAppTheme } from '@rranker/sdk/theme/app-theme';

export const PhigrosSongRow = memo(function PhigrosSongRow({
  song,
  blurUrl,
  favorite = false,
  favoritePending = false,
  onFavoriteChange,
  matchedAlias,
}: {
  song: Song;
  blurUrl: string | null;
  favorite?: boolean;
  favoritePending?: boolean;
  onFavoriteChange?: (songId: string, favorite: boolean) => void;
  matchedAlias?: string;
}) {
  const theme = useAppTheme();
  const presentation = presentPhigrosSong(song);

  return (
    <GameSongRow
      presentation={presentation}
      matchedAlias={matchedAlias} coverSource={blurUrl} coverLabel="曲绘" placeholderColor={theme.input}
      favorite={favorite} favoritePending={favoritePending} onFavoriteChange={onFavoriteChange ? value => onFavoriteChange(song.id, value) : undefined}
      badges={(
        <SongRowBadges>
            {[...(song.charts ?? [])]
              .sort((a, b) => a.levelIndex - b.levelIndex)
              .map((chart) => (
                <PhigrosDifficultyBadge
                  key={`${chart.songId}-${chart.levelIndex}`}
                  levelIndex={chart.levelIndex}
                  constant={chart.difficultyConstant}
                  showLabel={false}
                />
              ))}
        </SongRowBadges>
      )}
    />
  );
});
