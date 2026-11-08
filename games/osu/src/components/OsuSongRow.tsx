import { GameSongRow, SongRowBadges } from '@rranker/sdk/components/game-content/GameSongRow';
import { GameDifficultyBadge } from '@rranker/sdk/components/game-content/GameDifficultyBadge';
import type { OsuGameId } from '@rranker/game-osu';
import type { OsuCatalogSong } from '@rranker/game-osu/domain/osu';
import { resolveOsuStarTheme } from '@rranker/game-osu/domain/osu-star-theme';

export function OsuSongRow({ gameId, song }: {
  gameId: OsuGameId;
  song: OsuCatalogSong;
}) {
  return (
    <GameSongRow
      presentation={{
        key: String(song.beatmapSetId),
        gameId,
        route: { gameId: gameId, params: { songId: String(song.beatmapSetId) } },
        title: song.title,
        subtitle: song.artist,
        accessibilityLabel: `歌曲 ${song.title}`,
        chartBadges: [],
      }}
      coverSource={song.listCover} coverLabel={`封面 ${song.title}`} placeholderColor="transparent"
      badges={song.difficultyRatings.length > 0 ? (
        <SongRowBadges>
          {song.difficultyRatings.map((rating, index) => (
            <GameDifficultyBadge
              key={`${rating}-${index}`}
              testID="osu-catalog-difficulty-badge"
              text=" "
              theme={resolveOsuStarTheme(rating)}
              /** 空胶囊需左对齐，避免拉伸成整行。 */
              style={{ alignSelf: 'flex-start', minWidth: 0, paddingHorizontal: 4 }}
            />
          ))}
        </SongRowBadges>
      ) : null}
      testID={`osu-song-row-${song.beatmapSetId}`}
    />
  );
}
