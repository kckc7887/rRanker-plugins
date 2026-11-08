import { createElement } from 'react';
import type { PluginPageProps } from '@rranker/sdk';
import { MajdataSongDetail } from '../components/MajdataSongDetail';

export function DetailPage({ params }: PluginPageProps) {
  return createElement(MajdataSongDetail, { songId: params.songId, initialLevelIndex: params.levelIndex === undefined ? undefined : Number(params.levelIndex) });
}
