import { useAccountBindingRequest } from '@rranker/sdk/hooks/use-account-binding-flow';
import type { SourceLoginProps } from '@rranker/sdk/plugins';
import { useNotification } from '@rranker/sdk/components/AppNotification';
import { useAccountStore } from '@rranker/sdk/state/account-store';
import { bindOrSwitchPublicPlayer } from '@rranker/sdk/screens/game-accounts-actions';
import { TufPlayerPickerSheet } from './components/TufPlayerPickerSheet';
import { createTufBoundAccount } from '@rranker/game-adofai/accounts';
import { TufAccountStore } from './storage/tuf-account-store';
import type { TufPlayer } from '@rranker/game-adofai/domain/tuf';
import { resolveTufAvatarUrl } from '@rranker/game-adofai/domain/tuf';
const store = new TufAccountStore();
export function BindingSheet({ visible, onClose, onSuccess }: SourceLoginProps & { onClose: () => void }) {
  const { showNotification } = useNotification();
  const requests = useAccountBindingRequest(visible, 'tuf', 'adofai');
  const select = async (player: TufPlayer) => {
    const request = requests.begin();
    if (!request) return;
    try {
      const account = createTufBoundAccount({ playerId: player.id, displayName: player.name, avatarUrl: resolveTufAvatarUrl(player) });
      const state = useAccountStore.getState();
      await bindOrSwitchPublicPlayer({ assertCurrent: request.assertCurrent, existing: state.boundAccounts.find(item => item.id === account.id),
        create: () => account, persist: async (_account, assertCurrent) => { await store.upsert({ playerId: player.id, displayName: player.name, avatarUrl: account.avatarUrl }, assertCurrent); },
        existingMessage: item => `已绑定 TUF 玩家「${item.displayName}」`,
        successMessage: item => `已绑定 TUF 玩家「${item.displayName}」`,
        onExistingBound: onSuccess, onCreated: onSuccess, upsertBoundAccount: state.upsertBoundAccount,
        setMessage: message => showNotification({ title: '绑定成功', message, variant: 'info' }), showNotification });
    } finally { request.finish(); }
  };
  return <TufPlayerPickerSheet visible={visible} onClose={onClose} onSelect={select} />;
}
