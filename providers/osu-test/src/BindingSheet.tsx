import { useAccountBindingRequest } from '@rranker/sdk/hooks/use-account-binding-flow';
import { useState } from 'react';
import type { SourceLoginProps } from '@rranker/sdk/plugins';
import { useNotification } from '@rranker/sdk/components/AppNotification';
import { useSession } from '@rranker/sdk/state/session-store';
import { useDebugStore } from '@rranker/sdk/state/debug-store';
import { switchBoundAccount } from '@rranker/sdk/services/switch-bound-account';
import { providerErrorToUserMessage } from '@rranker/sdk/providers/errors';
import { OsuModeSelectSheet } from '@rranker/game-osu/components/OsuModeSelectSheet';
import { isOsuGameId, type OsuGameId } from '@rranker/game-osu';
import { createAccount } from './accounts';

export function BindingSheet({ visible, onClose, onSuccess }: SourceLoginProps & { onClose: () => void }) {
  const requests = useAccountBindingRequest(visible, 'osu-test');
  const [busy, setBusy] = useState(false);
  const accounts = useSession(state => state.boundAccounts);
  const { showNotification } = useNotification();
  const add = async (modes: readonly OsuGameId[]) => {
    const debug = useDebugStore.getState();
    if (!(debug.hydrated && debug.testAccountsEnabled)) return;
    const task = requests.begin();
    if (!task) return;
    setBusy(true);
    try {
      let selected: string | undefined;
      for (const gameId of modes) {
        const account = await createAccount(gameId, useSession.getState().boundAccounts, task.assertCurrent);
        task.assertCurrent();
        useSession.getState().upsertBoundAccount(account);
        selected ??= account.id;
      }
      if (selected && await switchBoundAccount(selected, { navigateToOverview: false })) onSuccess();
    } catch (error) {
      showNotification({ title: '添加失败', message: providerErrorToUserMessage(error, '无法添加 osu! 示例账号，请重试。'), variant: 'error' });
    } finally { task.finish(); setBusy(false); }
  };
  return <OsuModeSelectSheet visible={visible} alreadyBound={accounts.filter(account => account.providerId === 'osu-test').map(account => account.gameId).filter(isOsuGameId)}
    busy={busy} submitLabel="添加选中模式" onClose={onClose} onSubmit={modes => void add(modes)} />;
}
