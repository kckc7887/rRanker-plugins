import { useAccountBindingRequest } from '@rranker/sdk/hooks/use-account-binding-flow';
import type { SourceLoginProps } from '@rranker/sdk/plugins';
import { useNotification } from '@rranker/sdk/components/AppNotification';
import { useAccountStore } from '@rranker/sdk/state/account-store';
import { bindOrSwitchPublicPlayer } from '@rranker/sdk/screens/game-accounts-actions';
import { PhiraPlayerPickerSheet } from './components/PhiraPlayerPickerSheet';
import { createPhiraBoundAccount } from '@rranker/game-phira/accounts';
import { PhiraAccountStore } from './storage/phira-account-store';
import type { PhiraUser } from '@rranker/game-phira/domain/phira';
const store = new PhiraAccountStore();
export function BindingSheet({ visible, onClose, onSuccess }: SourceLoginProps & { onClose: () => void }) {
  const { showNotification } = useNotification();
  const requests = useAccountBindingRequest(visible, 'phira-community', 'phira');
  const select = async (player: PhiraUser) => {
    const request = requests.begin();
    if (!request) return;
    try {
      const account = createPhiraBoundAccount({ playerId: player.id, displayName: player.name, rks: player.rks, avatarUrl: player.avatar });
      const state = useAccountStore.getState();
      await bindOrSwitchPublicPlayer({ assertCurrent: request.assertCurrent, existing: state.boundAccounts.find(item => item.id === account.id),
        create: () => account, persist: async (_account, assertCurrent) => { await store.upsert({ playerId: player.id, displayName: player.name, avatarUrl: player.avatar }, assertCurrent); },
        existingMessage: item => `已绑定 Phira 玩家「${item.displayName}」`,
        successMessage: item => `已绑定 Phira 玩家「${item.displayName}」`,
        onExistingBound: onSuccess, onCreated: onSuccess, upsertBoundAccount: state.upsertBoundAccount,
        setMessage: message => showNotification({ title: '绑定成功', message, variant: 'info' }), showNotification });
    } finally { request.finish(); }
  };
  return <PhiraPlayerPickerSheet visible={visible} onClose={onClose} onSelect={select} />;
}
