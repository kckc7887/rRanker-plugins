import { createElement } from 'react';
import type { PluginPageProps } from '@rranker/sdk';
import { PhiraSongDetailScreen } from '../screens/PhiraScreens';

export function DetailPage({ params }: PluginPageProps) {
  return createElement(PhiraSongDetailScreen, { chartId: params.songId });
}
