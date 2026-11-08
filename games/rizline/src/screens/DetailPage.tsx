import { createElement } from 'react';
import type { PluginPageProps } from '@rranker/sdk';
import { RizlineSongDetail } from '../components/RizlineSongDetail';

export function DetailPage({ params }: PluginPageProps) {
  return createElement(RizlineSongDetail, { songId: params.songId, initialLevelIndex: params.levelIndex === undefined ? undefined : Number(params.levelIndex) });
}
