import { applyLxnsTokenRotation } from '@rranker/provider-lxns/rotation';
import { useCallback, useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import { getDataSource, type OverviewActionsProps } from '@rranker/sdk';
import { MaimaiSyncGuideContent } from '@rranker/tool-maimai/components/MaimaiSyncGuideSheet';
import { MaimaiUploadTabs } from '@rranker/game-maimai/components/MaimaiUploadTabs';
import { useDetailedCatalog } from '@rranker/game-maimai/hooks/use-detailed-catalog';
import { UploadDataSheet } from '@rranker/tool-maimai/components/UploadDataSheet';
import { overviewStyles as styles } from '@rranker/sdk/features/overview/overview-styles';
import { useOverviewUpload } from '@rranker/tool-maimai/hooks/use-overview-upload';
import { useVisibleBoundAccounts } from '@rranker/sdk/hooks/use-visible-bound-accounts';
import { compactUploadPhaseLabel } from '@rranker/tool-maimai/services/upload-maimai-from-friend-code';
import { useSession } from '@rranker/sdk/state/session-store';
import { useAppTheme } from '@rranker/sdk/theme/app-theme';

export function OverviewActions({ bundle, syncBusy, onSync, operation, registerRefresh }: OverviewActionsProps) {
  const theme = useAppTheme();
  const boundAccounts = useVisibleBoundAccounts();
  const activeAccountId = useSession(state => state.activeAccountId);
  const activeGameId = useSession(state => state.activeGameId);
  const sessionsByAccountId = useSession(state => state.sessionsByAccountId);
  const catalogQuery = useDetailedCatalog();
  const { data: catalogData, refetch: refetchCatalog } = catalogQuery;
  const requestUploadCatalog = useCallback(async () => catalogData ?? (await refetchCatalog()).data, [catalogData, refetchCatalog]);
  const { uploadVisible, maimaiUploadPage, setMaimaiUploadPage, maimaiSourceAccountId, setMaimaiSourceAccountId,
    maimaiTransferTargetIds, setMaimaiTransferTargetIds, uploadPhase, setUploadPhase, maimaiLxnsSources,
    maimaiTransferTargets, maimaiLxnsGuideAvailable, friendCodeUploadBusy, showingMaimaiSyncGuide,
    currentUploadSelection, finishUpload, syncMaimaiFromLxns, openUpload, closeUpload } = useOverviewUpload({
      boundAccounts, activeAccountId, activeGameId, sessionsByAccountId, catalogQuery,
      ratingDigits: bundle.profile.ratingDigits, syncBusy, operation,
    });
  const local = bundle.providerId === 'local';
  const uploadHint = compactUploadPhaseLabel(uploadPhase);
  const source = bundle.providerId ? getDataSource(bundle.providerId) : undefined;
  const hint = local ? uploadHint : source?.bindingKind === 'fixture' ? '示例查分器' : source?.title ?? '本地';
  useEffect(() => local ? registerRefresh(openUpload) : undefined, [local, registerRefresh, openUpload]);
  const sync = <Pressable accessibilityLabel={local ? `同步本地查分器数据，${hint}` : `同步数据，当前 ${hint}`}
    disabled={!local && syncBusy} onPress={local ? openUpload : () => void onSync()}
    style={({ pressed }) => [local ? [styles.syncButton, { backgroundColor: theme.accent }] : styles.actionHalf,
      pressed && styles.syncPressed, !local && syncBusy && styles.syncDisabled]}>
    <Text style={[styles.syncText, { color: theme.onAccent }]}>{!local && syncBusy ? '同步中…' : '同步数据'}</Text>
    <Text style={[styles.actionHint, { color: theme.onAccent, opacity: 0.75 }]}>{hint}</Text>
  </Pressable>;
  return <>
    {local ? sync : <View style={[styles.actionRow, { backgroundColor: theme.accent }]}>
      <Pressable accessibilityLabel={`上传数据，${uploadHint}`} onPress={openUpload}
        style={({ pressed }) => [styles.actionHalf, pressed && styles.syncPressed]}>
        <Text style={[styles.syncText, { color: theme.onAccent }]}>上传数据</Text>
        <Text style={[styles.actionHint, { color: theme.onAccent, opacity: 0.75 }]}>{uploadHint}</Text>
      </Pressable>
      <View style={[styles.actionDivider, { backgroundColor: theme.onAccent, opacity: 0.35 }]} />{sync}
    </View>}
      <UploadDataSheet
        visible={uploadVisible}
        accounts={boundAccounts}
        sessionsByAccountId={sessionsByAccountId}
        catalog={catalogData}
        requestCatalog={requestUploadCatalog}
        onClose={closeUpload}
        onPhaseChange={setUploadPhase}
        onFinished={finishUpload}
        temporarySelectedAccountIds={currentUploadSelection}
        onLxnsTokensRotated={applyLxnsTokenRotation}
        headerAccessory={(
          <MaimaiUploadTabs
            value={maimaiUploadPage}
            syncGuideAvailable={maimaiLxnsGuideAvailable}
            disabled={friendCodeUploadBusy || syncBusy}
            onChange={setMaimaiUploadPage}
          />
        )}
        contentOverride={showingMaimaiSyncGuide ? (
          <MaimaiSyncGuideContent
            syncing={syncBusy}
            sourceAccounts={maimaiLxnsSources}
            targets={maimaiTransferTargets}
            selectedSourceAccountId={maimaiSourceAccountId}
            selectedTargetAccountIds={maimaiTransferTargetIds}
            onSelectSource={(accountId) => {
              setMaimaiSourceAccountId(accountId);
              setMaimaiTransferTargetIds((ids) => ids.filter((id) => id !== accountId));
            }}
            onToggleTarget={(accountId) => {
              setMaimaiTransferTargetIds((ids) => (
                ids.includes(accountId)
                  ? ids.filter((id) => id !== accountId)
                  : [...ids, accountId]
              ));
            }}
            onClose={closeUpload}
            onSync={syncMaimaiFromLxns}
          />
        ) : undefined}
        uploadMethod={maimaiUploadPage === 'qr' ? 'qr' : 'friend_code'}
        externalBusy={showingMaimaiSyncGuide && syncBusy}
      />
  </>;
}
