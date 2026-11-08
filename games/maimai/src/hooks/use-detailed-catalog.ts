import type { AliasSnapshot, CatalogSnapshot, Song } from '@rranker/game-maimai/domain/models';
import { useAliasedCatalog } from '@rranker/sdk/hooks/use-aliased-catalog';
import { maimaiCatalogOptions } from '@rranker/game-maimai/services/maimai-catalog-query';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';

import { queryClient } from '@rranker/sdk/state/query-client';
import { UNBOUND_ACCOUNT_ID, useSession } from '@rranker/sdk/state/session-store';

import { useCachedTabActive } from '@rranker/sdk/components/CachedTabScreen';
import { requireDetailedCatalogProvider, type DetailedCatalogProvider } from '@rranker/game-maimai/data-source';
import { getGameResourceSource, resolveGameResources, usePluginRevision } from '@rranker/sdk/registry';
import { captureResourceWrites, subscribeResourceWrites } from '@rranker/sdk/services/snapshot-cache-utils';

export function useDetailedCatalog(enabled = true) {
  usePluginRevision();
  const tabActive = useCachedTabActive();
  const activeAccountId = useSession((state) => state.activeAccountId);
  const activeGameId = useSession((state) => state.activeGameId);
  const provider = resolveGameResources('maimai') as DetailedCatalogProvider | undefined;
  const canLoad = enabled && tabActive && activeGameId === 'maimai' && activeAccountId !== UNBOUND_ACCOUNT_ID;
  return useAliasedCatalog<CatalogSnapshot, AliasSnapshot>(maimaiCatalogOptions(queryClient, provider ?? null, canLoad));
}

export function useMaimaiSongDetail(
  songId: string | undefined,
  catalog: CatalogSnapshot | undefined,
  enabled = true,
) {
  usePluginRevision();
  const active = useCachedTabActive();
  const activeGameId = useSession((state) => state.activeGameId);
  const provider = resolveGameResources('maimai') as DetailedCatalogProvider | undefined;
  const normalizedSongId = songId?.trim();
  return useQuery<Song>({ meta: { pluginId: 'game.maimai', gameId: 'maimai', sourcePluginId: getGameResourceSource('maimai')?.id },
    enabled: enabled && active && activeGameId === 'maimai' && !!normalizedSongId && !!provider,
    notifyOnChangeProps: active ? undefined : [],
    queryKey: ['maimai-song-detail', normalizedSongId],
    queryFn: ({ signal }) => requireDetailedCatalogProvider(provider ?? null).getSong(normalizedSongId!, catalog, signal),
    staleTime: Infinity,
    gcTime: 0,
    retry: false,
  });
}

type TransientDetailedCatalogState = {
  data: CatalogSnapshot | undefined;
  error: unknown;
  isLoading: boolean;
  refetch: () => void;
};

export function useTransientDetailedMaimaiCatalog(enabled = true): TransientDetailedCatalogState {
  usePluginRevision();
  const provider = resolveGameResources('maimai') as DetailedCatalogProvider | undefined;
  const sourceId = getGameResourceSource('maimai')?.id;
  const activeGameId = useSession((state) => state.activeGameId);
  const [attempt, setAttempt] = useState(0);
  const [data, setData] = useState<CatalogSnapshot>();
  const [error, setError] = useState<unknown>();
  const [isLoading, setIsLoading] = useState(false);
  const refetch = useCallback(() => setAttempt((value) => value + 1), []);

  useEffect(() => {
    if (!enabled || activeGameId !== 'maimai' || !provider || !sourceId) {
      setData(undefined);
      setError(undefined);
      setIsLoading(false);
      return;
    }
    let active = true;
    const controller = new AbortController();
    const scopes = ['maimai', sourceId];
    const guards = scopes.map(scope => captureResourceWrites(scope, controller.signal));
    const subscriptions = scopes.map(scope => subscribeResourceWrites(scope, () => controller.abort()));
    setData(undefined);
    setError(undefined);
    setIsLoading(true);
    void provider.getDetailedCatalog(controller.signal).then((catalog) => {
      if (!active) return;
      try { for (const guard of guards) guard(); } catch { return; }
      setData(catalog);
      setIsLoading(false);
    }, (loadError: unknown) => {
      if (!active || controller.signal.aborted) return;
      setError(loadError);
      setIsLoading(false);
    });
    return () => {
      active = false;
      controller.abort();
      for (const unsubscribe of subscriptions) unsubscribe();
    };
  }, [activeGameId, attempt, enabled, provider, sourceId]);

  return { data, error, isLoading, refetch };
}
