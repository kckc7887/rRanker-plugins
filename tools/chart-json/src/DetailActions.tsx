import { useEffect, useRef } from 'react';
import { router, useNavigation } from 'expo-router';
import { pluginHref, openPluginPage, type PluginDetailProps } from '@rranker/sdk';
import { ChartAction } from '@rranker/sdk/components/game-content/GameChartResultCard';
import { useNotification } from '@rranker/sdk/components/AppNotification';
import { phigrosLevelColors, phigrosLevelLabel } from '@rranker/game-phigros/domain/phigros-level-theme';

export function DetailActions(props: PluginDetailProps) {
  return props.target.gameId === 'phigros' && props.target.kind === 'chart'
    ? <PhigrosChartAction {...props} />
    : null;
}

function PhigrosChartAction({ target, title }: PluginDetailProps) {
  const { showNotification } = useNotification();
  const navigation = useNavigation();
  const cancelNavigation = useRef<(() => void) | null>(null);
  useEffect(() => () => cancelNavigation.current?.(), []);
  const levelIndex = Number(target.target.levelIndex);
  const colors = phigrosLevelColors(levelIndex);
  const label = phigrosLevelLabel(levelIndex);
  return <ChartAction label="查看谱面确认"
    accessibilityLabel={`查看谱面确认：${title ?? target.target.songId} ${label}`}
    onPress={() => {
      cancelNavigation.current?.();
      cancelNavigation.current = openPluginPage(pluginHref({ pluginId: 'tool.chart-json', pageId: 'chart-preview', gameId: 'phigros' }), {
        payload: { game: 'phigros', songId: target.target.songId, levelIndex, title },
        push: href => router.push(href),
        topRouteName: () => {
          const state = typeof navigation.getState === 'function' ? navigation.getState() : undefined;
          return state?.routes[state.index ?? 0]?.name;
        },
        onFail: message => showNotification({ title: '无法打开谱面确认', message, variant: 'error' }),
      });
    }}
    stack="next" style={{ backgroundColor: 'transparent', borderColor: colors.fg }}
    textStyle={{ color: colors.fg }} />;
}
