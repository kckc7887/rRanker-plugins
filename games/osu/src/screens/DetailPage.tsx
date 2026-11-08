import { createElement } from 'react';
import type { PluginPageProps } from '@rranker/sdk';
import { OsuSongDetail } from '../components/OsuSongDetail';

export function DetailPage({ params }: PluginPageProps) {
  return createElement(OsuSongDetail, { beatmapsetId: params.songId, initialBeatmapId: params.beatmapId === undefined ? undefined : Number(params.beatmapId), initialScoreId: params.scoreId === undefined ? undefined : Number(params.scoreId) });
}
