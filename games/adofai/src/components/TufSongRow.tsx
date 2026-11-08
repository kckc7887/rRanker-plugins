import { memo } from 'react';
import { TufLevelImage } from '@rranker/game-adofai/components/TufLevelImage';
import { TufDifficultyBadge } from '@rranker/game-adofai/components/TufDifficultyBadge';
import { GameSongRow } from '@rranker/sdk/components/game-content/GameSongRow';
import type { TufLevel } from '@rranker/game-adofai/domain/tuf';
import { presentTufLevel } from '@rranker/game-adofai/presentation';

export const TufSongRow = memo(function TufSongRow({ level }: { level: TufLevel }) {
  const presentation = presentTufLevel(level);
  const badge = presentation.chartBadges[0];

  return <GameSongRow presentation={presentation} wholeRowPressable
    cover={<TufLevelImage level={level} thumbnail />}
    badges={badge ? <TufDifficultyBadge difficulty={badge} source={level.difficulty} /> : null} />;
});
