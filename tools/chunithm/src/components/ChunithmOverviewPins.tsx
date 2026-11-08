import { useNotification } from '@rranker/sdk/components/AppNotification';
import { gameToolHref, type PluginOverviewProps } from '@rranker/sdk';
import { useCollectionPins } from '../state/pins';
import { CollectionProgressBar } from '@rranker/sdk/components/CollectionProgress';
import { overviewStyles as styles } from '@rranker/sdk/features/overview/overview-styles';

import { ChunithmCollectionPreview } from '@rranker/game-chunithm/components/ChunithmCollectionImage';
import { router } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';

import { calculateChunithmCollectionProgress, isChunithmCollectionComputable, type ChunithmCollectionKind } from '@rranker/game-chunithm/domain/chunithm-collections';
import type { ChunithmScore } from '@rranker/game-chunithm/domain/chunithm-personal';
import type { PinnedCollection } from '../state/pins';
import { useChunithmCollections } from '@rranker/game-chunithm/hooks/use-chunithm-collections';

import { useAppTheme } from '@rranker/sdk/theme/app-theme';

export function PinnedChunithmCollectionCards({
  pinned,
  scores,
}: {
  pinned: readonly PinnedCollection[];
  scores: readonly ChunithmScore[];
}) {
  const theme = useAppTheme();
  const byKind = useMemo(() => {
    const map = new Map<ChunithmCollectionKind, PinnedCollection[]>();
    for (const entry of pinned) {
      const list = map.get(entry.kind) ?? [];
      list.push(entry);
      map.set(entry.kind, list);
    }
    return map;
  }, [pinned]);
  const kindList = [...byKind.keys()];

  return kindList.map((kind) => (
    <PinnedChunithmCollectionKindGroup
      key={kind}
      kind={kind}
      entries={byKind.get(kind) ?? []}
      scores={scores}
      theme={theme}
    />
  ));
}

function PinnedChunithmCollectionKindGroup({
  kind,
  entries,
  scores,
  theme,
}: {
  kind: ChunithmCollectionKind;
  entries: readonly PinnedCollection[];
  scores: readonly ChunithmScore[];
  theme: ReturnType<typeof useAppTheme>;
}) {
  const collections = useChunithmCollections(kind);
  const items = useMemo(() => {
    const wanted = new Set(entries.map((entry) => entry.id));
    return (collections.data?.items ?? []).filter((item) => wanted.has(item.id));
  }, [collections.data?.items, entries]);

  return items.map((collection) => {
    const progress = isChunithmCollectionComputable(collection)
      ? calculateChunithmCollectionProgress(collection, scores)
      : null;
    return (
      <Pressable
        key={`${kind}:${collection.id}`}
        accessibilityRole="button"
        accessibilityLabel={`打开主页收藏品 ${collection.name || `#${collection.id}`}`}
        onPress={() => { const href = gameToolHref('chunithm', 'chunithm-collections', { kind, id: String(collection.id) }); if (href) router.push(href); }}
      >
        <View style={[styles.card, { backgroundColor: theme.surface }]}>
          <Text style={styles.pinnedToolEyebrow}>收藏品进度</Text>
          <View style={styles.collectionHomeTitleRow}>
            <ChunithmCollectionPreview height={34} borderRadius={6} kind={kind} collection={collection} />
            <Text numberOfLines={1} style={[styles.cardTitle, styles.collectionHomeTitle, { color: theme.text }]}>
              {collection.name || `#${collection.id}`}
            </Text>
          </View>
          {progress ? (
            <>
              <CollectionProgressBar progress={progress} />
              <Text style={[styles.body, { color: theme.textSecondary }]}>
                {progress.completed} / {progress.total} 完成
              </Text>
            </>
          ) : (
            <Text style={[styles.body, { color: theme.textSecondary }]}>该收藏品没有可计算的达成条件</Text>
          )}
        </View>
      </Pressable>
    );
  });
}

export function OverviewCards({ bundle }: PluginOverviewProps) {
  const hydrate = useCollectionPins(state => state.hydrate);
  const { showNotification } = useNotification();
  useEffect(() => {
    void hydrate().catch(() => showNotification({ title: '无法读取置顶内容', message: '请稍后重试。', variant: 'error' }));
  }, [hydrate, showNotification]);
  const pinned = useCollectionPins(state => state.pinsByGame)[bundle.gameId] ?? [];
  return bundle.payload.kind === 'chunithm' && pinned?.length
    ? <PinnedChunithmCollectionCards pinned={pinned} scores={bundle.payload.scores} /> : null;
}
