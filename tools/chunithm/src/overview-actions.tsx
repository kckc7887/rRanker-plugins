import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { getDataSource, type OverviewActionsProps } from '@rranker/sdk';
import { ChunithmSyncGuideSheet } from '@rranker/tool-chunithm/components/ChunithmSyncGuideSheet';
import { CHUNITHM_MAINTENANCE_MESSAGE, isChunithmMaintenanceWindow } from '@rranker/game-chunithm/domain/chunithm-maintenance';
import { useNotification } from '@rranker/sdk/components/AppNotification';
import { overviewStyles as styles } from '@rranker/sdk/features/overview/overview-styles';
import { useAppTheme } from '@rranker/sdk/theme/app-theme';

export function OverviewActions({ bundle, syncBusy, onSync }: OverviewActionsProps) {
  const theme = useAppTheme();
  const { showNotification } = useNotification();
  const [visible, setVisible] = useState(false);
  const source = bundle.providerId ? getDataSource(bundle.providerId) : undefined;
  const hint = source?.bindingKind === 'fixture' ? '示例查分器' : source?.title ?? '本地';
  const open = () => {
    if (isChunithmMaintenanceWindow()) {
      showNotification({ title: '游戏服务器维护中', message: CHUNITHM_MAINTENANCE_MESSAGE, variant: 'warning' });
      return;
    }
    setVisible(true);
  };
  if (bundle.payload.kind !== 'chunithm') return <View style={[styles.card, { backgroundColor: theme.surface }]}>
    <Text style={[styles.cardTitle, { color: theme.text }]}>请绑定落雪账号</Text>
    <Text style={[styles.body, { color: theme.textSecondary }]}>前往游戏管理绑定后，即可同步中二节奏成绩。</Text>
  </View>;
  return <>
    <View style={[styles.actionRow, { backgroundColor: theme.accent }]}>
      <Pressable accessibilityLabel="上传数据，打开同步引导" onPress={open} style={({ pressed }) => [styles.actionHalf, pressed && styles.syncPressed]}>
        <Text style={[styles.syncText, { color: theme.onAccent }]}>上传数据</Text>
        <Text style={[styles.actionHint, { color: theme.onAccent, opacity: 0.75 }]}>同步引导</Text>
      </Pressable>
      <View style={[styles.actionDivider, { backgroundColor: theme.onAccent, opacity: 0.35 }]} />
      <Pressable accessibilityLabel={`同步数据，当前 ${hint}`} disabled={syncBusy} onPress={() => void onSync()}
        style={({ pressed }) => [styles.actionHalf, pressed && styles.syncPressed, syncBusy && styles.syncDisabled]}>
        <Text style={[styles.syncText, { color: theme.onAccent }]}>{syncBusy ? '同步中…' : '同步数据'}</Text>
        <Text style={[styles.actionHint, { color: theme.onAccent, opacity: 0.75 }]}>{hint}</Text>
      </Pressable>
    </View>
    <ChunithmSyncGuideSheet visible={visible} syncing={syncBusy} onClose={() => setVisible(false)} onSync={onSync} />
  </>;
}
