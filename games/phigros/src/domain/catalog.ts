import type { ChartType } from './models';

export function chartVersionKey(songId: string | number, type: ChartType, levelIndex: number): string {
  return String(songId) + ':' + type + ':' + levelIndex;
}
