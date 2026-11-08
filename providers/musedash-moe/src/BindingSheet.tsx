import { useAccountBindingRequest } from '@rranker/sdk/hooks/use-account-binding-flow';
import type { SourceLoginProps } from '@rranker/sdk/plugins';
import { useNotification } from '@rranker/sdk/components/AppNotification';
import { useAccountStore } from '@rranker/sdk/state/account-store';
import { bindOrSwitchPublicPlayer } from '@rranker/sdk/screens/game-accounts-actions';
import { MuseDashPlayerPickerSheet } from './components/MuseDashPlayerPickerSheet';
import { createMuseDashBoundAccount } from '@rranker/game-musedash/accounts';
import { MuseDashAccountStore } from './storage/musedash-account-store';
import type { MuseDashSearchResult } from './components/MuseDashPlayerPickerSheet';
const store = new MuseDashAccountStore();
export function BindingSheet({ visible, onClose, onSuccess }: SourceLoginProps & { onClose: () => void }) {
  const { showNotification } = useNotification();
  const requests = useAccountBindingRequest(visible, 'musedash-moe', 'musedash');
  const select = async (player: MuseDashSearchResult) => {
    const request = requests.begin();
    if (!request) return;
    try {
      const account = createMuseDashBoundAccount({ userId: player.userId, displayName: player.nickname });
      const state = useAccountStore.getState();
      await bindOrSwitchPublicPlayer({ assertCurrent: request.assertCurrent, existing: state.boundAccounts.find(item => item.id === account.id),
        create: () => account, persist: async (_account, assertCurrent) => { await store.upsert({ userId: player.userId, displayName: player.nickname }, assertCurrent); },
        existingMessage: item => `已绑定 喵斯快跑 玩家「${item.displayName}」`,
        successMessage: item => `已绑定 喵斯快跑 玩家「${item.displayName}」`,
        onExistingBound: onSuccess, onCreated: onSuccess, upsertBoundAccount: state.upsertBoundAccount,
        setMessage: message => showNotification({ title: '绑定成功', message, variant: 'info' }), showNotification });
    } finally { request.finish(); }
  };
  return <MuseDashPlayerPickerSheet visible={visible} onClose={onClose} onSelect={select} />;
}
