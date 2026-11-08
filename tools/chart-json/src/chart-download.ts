import type { ChartDownload } from '@rranker/sdk';
import { downloadPhigrosChartAsPhiraPackage } from './features/phigros-chart-download/chart-package-download';
import { downloadPhiraChartPackage } from './features/phira-chart-download/chart-package-download';

export const downloadPhigros: ChartDownload = (params, { includeVideo: _includeVideo, ...options }) => downloadPhigrosChartAsPhiraPackage({
  songId: params.songId, levelIndex: Number(params.levelIndex), title: params.title,
}, options);
export const downloadPhira: ChartDownload = (params, { includeVideo: _includeVideo, ...options }) => downloadPhiraChartPackage({
  file: params.file, name: params.name, level: params.level,
}, options);
