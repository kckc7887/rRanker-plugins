import { createElement } from 'react';
import type { PluginPageProps } from '@rranker/sdk';
import { ExampleSongDetail } from '../components/ExampleSongDetail';

export function DetailPage({ params }: PluginPageProps) {
  return createElement(ExampleSongDetail, { songId: params.songId });
}
