import { createElement } from 'react';
import type { PluginPageProps } from '@rranker/sdk';
import { MuseDashSongDetailScreen } from '../screens/MuseDashScreens';

export function DetailPage({ params }: PluginPageProps) {
  return createElement(MuseDashSongDetailScreen, { songId: params.songId, levelIndex: params.levelIndex === undefined ? undefined : Number(params.levelIndex) });
}
