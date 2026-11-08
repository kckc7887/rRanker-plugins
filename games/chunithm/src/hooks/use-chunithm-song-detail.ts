import { useQuery } from '@tanstack/react-query';
import { useCachedTabActive } from '@rranker/sdk/components/CachedTabScreen';
import {
  type ChunithmSongDetailSnapshot,
} from '@rranker/game-chunithm/domain/chunithm';
import type { ChunithmResources } from '../data-source';
import { resolveGameResources, getGameResourceSource, usePluginRevision } from '@rranker/sdk/registry';
import { useSession } from '@rranker/sdk/state/session-store';

const CHUNITHM_SONG_DETAIL_SCHEMA_VERSION = 1;


export function useChunithmSongDetail(songId: string | undefined) {
  const active = useCachedTabActive();
  usePluginRevision();
  const provider = resolveGameResources('chunithm') as ChunithmResources | undefined;
  const activeGameId = useSession((state) => state.activeGameId);
  const normalizedSongId = songId?.trim();
  const queryKey = ['chunithm-song-detail', CHUNITHM_SONG_DETAIL_SCHEMA_VERSION, normalizedSongId];
  return useQuery({ meta: { pluginId: 'game.chunithm', gameId: 'chunithm', sourcePluginId: getGameResourceSource('chunithm')?.id },
    enabled: active && !!provider && activeGameId === 'chunithm' && !!normalizedSongId,
    notifyOnChangeProps: active ? undefined : [],
    queryKey,
    queryFn: ({ signal }): Promise<ChunithmSongDetailSnapshot> => provider!.getSongDetail(normalizedSongId!, signal),
  });
}
