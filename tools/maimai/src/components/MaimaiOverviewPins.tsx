import { useNotification } from '@rranker/sdk/components/AppNotification';
import { gameToolHref, type PluginOverviewProps } from '@rranker/sdk';
import { usePlatePins } from '../state/pins';

import { PlateProgressCard } from '@rranker/game-maimai/components/PlateProgressCard';
import { router } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { Pressable } from 'react-native';

import type { ScoreRecord } from '@rranker/game-maimai/domain/models';
import { calculatePlateProgress } from '@rranker/game-maimai/domain/plates';
import { usePlates } from '@rranker/game-maimai/hooks/use-plates';

export function PinnedPlateCards({ plateIds, records }: { plateIds: readonly number[]; records: readonly ScoreRecord[]; }) {
  const plates = usePlates();
  const pinnedPlates = useMemo(() => {
    const plateById = new Map((plates.data?.plates ?? []).map((plate) => [plate.id, plate]));
    return plateIds.flatMap((plateId) => {
      const plate = plateById.get(plateId);
      return plate ? [plate] : [];
    });
  }, [plateIds, plates.data?.plates]);

  return pinnedPlates.map((plate) => (
    <Pressable
      key={plate.id}
      accessibilityRole="button"
      accessibilityLabel={`打开主页牌子 ${plate.name}`}
      onPress={() => { const href = gameToolHref('maimai', 'plates', { plateId: String(plate.id) }); if (href) router.push(href); }}
    >
      <PlateProgressCard
        plate={plate}
        progress={calculatePlateProgress(plate, records)}
        eyebrow="牌子进度"
        testID={`overview-pinned-plate-${plate.id}`}
      />
    </Pressable>
  ));
}


export function OverviewCards({ bundle }: PluginOverviewProps) {
  const hydrate = usePlatePins(state => state.hydrate);
  const { showNotification } = useNotification();
  useEffect(() => {
    void hydrate().catch(() => showNotification({ title: '无法读取置顶内容', message: '请稍后重试。', variant: 'error' }));
  }, [hydrate, showNotification]);
  const plateIds = usePlatePins(state => state.pinsByGame)[bundle.gameId] ?? [];
  return bundle.payload.kind === 'maimai' && plateIds?.length
    ? <PinnedPlateCards plateIds={plateIds} records={bundle.payload.records} /> : null;
}
