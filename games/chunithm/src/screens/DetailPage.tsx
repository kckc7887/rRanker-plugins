import { createElement } from 'react';
import type { PluginPageProps } from '@rranker/sdk';
import { ChunithmSongDetail } from '../components/ChunithmSongDetail';

export function DetailPage({ params }: PluginPageProps) {
  return createElement(ChunithmSongDetail, { songId: params.songId, initialLevelIndex: params.levelIndex === undefined ? undefined : Number(params.levelIndex) });
}
