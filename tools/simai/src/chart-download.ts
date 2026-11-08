import type { ChartDownload } from '@rranker/sdk';
import { downloadMaimaiChartPackage } from './features/maimai-chart-download/maimai-chart-download';
import { downloadSimaiPackage } from '@rranker/sdk/features/chart-download-shared/simai-package';
import { MAJDATA_NAMES, majdataAsset } from '@rranker/game-majdata-net/domain/majdata';
import type { ChartType } from '@rranker/game-maimai/domain/models';

export const downloadMaimai: ChartDownload = (params, { includeVideo, ...options }) => downloadMaimaiChartPackage({
  songId: params.songId, chartType: params.chartType as ChartType, levelIndex: Number(params.levelIndex),
  levelLabel: params.levelLabel, title: params.title, includeVideo,
}, options);

export const downloadMajdata: ChartDownload = (params, { includeVideo, ...options }) => downloadSimaiPackage({
  title: params.title, suffix: MAJDATA_NAMES[Number(params.levelIndex)], resources: [
    { fileName: 'maidata.txt', url: majdataAsset(params.songId, 'chart') },
    { fileName: 'track.mp3', url: majdataAsset(params.songId, 'track') },
    { fileName: 'bg.auto', url: majdataAsset(params.songId, 'image', true) },
    ...(includeVideo ? [{ fileName: 'pv.mp4', url: majdataAsset(params.songId, 'video') }] : []),
  ],
}, options);
