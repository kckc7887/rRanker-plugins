import { PhiraDifficultyBadge } from '@rranker/game-phira/components/PhiraScoreVisuals';
import { memo } from 'react';
import { GameSongRow, SongRowBadges } from '@rranker/sdk/components/game-content/GameSongRow';
import type { PhiraChart } from '@rranker/game-phira/domain/phira';
import { presentPhiraSong } from '@rranker/game-phira/presentation';
import { useAppTheme } from '@rranker/sdk/theme/app-theme';

export const PhiraSongRow = memo(function PhiraSongRow({ chart }: { chart: PhiraChart }) {
  const theme = useAppTheme();
  return <GameSongRow presentation={presentPhiraSong(chart)} coverSource={chart.illustration}
    coverLabel="曲绘" placeholderColor={theme.input}
    badges={<SongRowBadges><PhiraDifficultyBadge constant={chart.difficulty} label={chart.level} /></SongRowBadges>} />;
});
