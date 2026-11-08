import type { ChartDownload } from '@rranker/sdk';
import { downloadOsuBeatmapsetPackage } from './features/osu-beatmapset-download/osu-beatmapset-download';

export const downloadOsu: ChartDownload = (params, { includeVideo, ...options }) => downloadOsuBeatmapsetPackage({
  beatmapsetId: Number(params.beatmapsetId), title: params.title, includeVideo,
}, options);
