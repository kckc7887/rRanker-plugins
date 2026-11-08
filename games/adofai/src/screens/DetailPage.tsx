import { createElement } from 'react';
import type { PluginPageProps } from '@rranker/sdk';
import { TufLevelDetailScreen } from '../screens/TufScreens';

export function DetailPage({ params }: PluginPageProps) {
  return createElement(TufLevelDetailScreen, { levelId: params.songId });
}
