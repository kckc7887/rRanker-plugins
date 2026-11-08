import { createElement } from 'react';
import type { PluginPageProps } from '@rranker/sdk';
import { PhigrosSongDetail } from '../components/PhigrosSongDetail';

export function DetailPage({ params }: PluginPageProps) {
  return createElement(PhigrosSongDetail, { songId: params.songId, levelIndex: params.levelIndex === undefined ? undefined : Number(params.levelIndex) });
}
