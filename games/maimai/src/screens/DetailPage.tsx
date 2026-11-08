import { createElement } from 'react';
import type { PluginPageProps } from '@rranker/sdk';
import { MaimaiSongDetailScreen } from '../components/MaimaiSongDetail';
import { useAppTheme } from '@rranker/sdk/theme/app-theme';

export function DetailPage({ params }: PluginPageProps) {
  const theme = useAppTheme();
  return createElement(MaimaiSongDetailScreen, { songId: params.songId, chartType: params.chartType as 'SD' | 'DX' | 'UTAGE' | undefined, initialLevelIndex: params.levelIndex === undefined ? undefined : Number(params.levelIndex), themeBackground: theme.background });
}
