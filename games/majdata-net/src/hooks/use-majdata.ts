import { resolveGameResources, getGameResourceSource, usePluginRevision } from '@rranker/sdk/registry';

import type { MajdataResources, MajdataDataSource } from '../data-source';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useBoundedQueries } from '@rranker/sdk/hooks/use-bounded-queries';
import { recordRuntimeError } from '@rranker/sdk/services/runtime-diagnostics-recorder';
import { useCachedTabActive } from '@rranker/sdk/components/CachedTabScreen';
import type { MajdataSong } from '@rranker/game-majdata-net/domain/majdata';
import { useSession } from '@rranker/sdk/state/session-store';
import { queryClient } from '@rranker/sdk/state/query-client';
import { invalidateMajdataCatalog } from '../services/game-data';
import { captureResourceWrites } from '@rranker/sdk/services/snapshot-cache-utils';

function resources(): MajdataResources {
 const value = resolveGameResources('majdata-net') as MajdataResources | undefined;
 if (!value) throw new Error('Majdata 曲库来源不可用');
 return value;
}

const options = { staleTime: Infinity, gcTime: 5 * 60_000, retry: false, refetchOnMount: false } as const;

const majdataSongKey = (id: string) => ['majdata-net', 'song', id] as const;

async function markMajdataSongFallback(id: string, assertCurrent: () => void): Promise<void> {
  const key = majdataSongKey(id);
  const displayed = queryClient.getQueryData<MajdataSong>(key);
  if (!displayed) return;
  const metadata = (await resources().readSongSnapshot(id))?.metadata;
  try { assertCurrent(); } catch { return; }
  const fetchedAt = metadata ? Date.parse(metadata.fetchedAt) : Number.NaN;
  queryClient.setQueryData(key, displayed, Number.isFinite(fetchedAt) ? { updatedAt: fetchedAt } : undefined);
}

function loadMajdataSongQuery(id: string, signal: AbortSignal): Promise<MajdataSong> {
  const source = getGameResourceSource('majdata-net');
  const guards = ['majdata-net', ...(source ? [source.id] : [])].map(scope => captureResourceWrites(scope, signal));
  const assertCurrent = () => { for (const guard of guards) guard(); };
  return resources().loadSong(
    id,
    signal,
    (fresh) => { try { assertCurrent(); } catch { return; } queryClient.setQueryData(majdataSongKey(id), fresh); },
    () => { void markMajdataSongFallback(id, assertCurrent).catch(error => recordRuntimeError('majdata-cache', error)); },
  );
}

export async function refreshMajdataCatalog(): Promise<void> {
  await invalidateMajdataCatalog(queryClient);
}
export function useMajdataSongs(sort: string, search: string) {
  usePluginRevision();
  const active = useCachedTabActive();
  return useInfiniteQuery({ meta: { pluginId: 'game.majdata-net', gameId: 'majdata-net', sourcePluginId: getGameResourceSource('majdata-net')?.id }, queryKey: ['majdata-net', 'catalog', sort, search], initialPageParam: 0,
    queryFn: ({ pageParam, signal }) => resources().getSongs(pageParam, sort, search, signal),
    getNextPageParam: (last, pages) => last.length < 30 ? undefined : pages.length, enabled: active, notifyOnChangeProps: active ? undefined : [], ...options });
}
export function useMajdataSong(id: string, enabled = true) {
  usePluginRevision();
  const active = useCachedTabActive();
  return useQuery({ meta: { pluginId: 'game.majdata-net', gameId: 'majdata-net', sourcePluginId: getGameResourceSource('majdata-net')?.id }, queryKey: majdataSongKey(id), queryFn: ({ signal }) => loadMajdataSongQuery(id, signal), enabled: active && enabled && !!id, notifyOnChangeProps: active ? undefined : [], ...options, staleTime: 0, refetchOnMount: true });
}
export function useMajdataLibrarySongs(ids: string[]) {
  usePluginRevision();
  const sourcePluginId = getGameResourceSource('majdata-net')?.id;
  const definitions = useMemo(() => [...new Set(ids)].map(id => ({ meta: { pluginId: 'game.majdata-net', gameId: 'majdata-net', sourcePluginId },
    queryKey: majdataSongKey(id), queryFn: ({ signal }: { signal: AbortSignal }) => loadMajdataSongQuery(id, signal),
    ...options, enabled: !!sourcePluginId, staleTime: 0, refetchOnMount: true,
  })), [ids, sourcePluginId]);
  return useBoundedQueries(definitions, 4, !!sourcePluginId).queries;
}
export function useMajdataParsedChart(song: MajdataSong | undefined, level: number) {
  usePluginRevision();
  const active = useCachedTabActive();
  return useQuery({ meta: { pluginId: 'game.majdata-net', gameId: 'majdata-net', sourcePluginId: getGameResourceSource('majdata-net')?.id }, queryKey: ['majdata-net', 'parsed', song?.id, song?.hash, level], queryFn: ({ signal }) => resources().loadParsedChart(song!, level, signal), enabled: active && !!song, notifyOnChangeProps: active ? undefined : [], ...options });
}
export function useMajdataRanking(id: string, enabled: boolean) {
  usePluginRevision();
  const active = useCachedTabActive(); const accountId = useSession(s => s.activeAccountId);
  const client = useSession(state => state.sourceClient) as MajdataDataSource | undefined;
  return useQuery({ meta: { pluginId: 'game.majdata-net', gameId: 'majdata-net', sourcePluginId: getGameResourceSource('majdata-net')?.id, accountId }, queryKey: ['majdata-net', 'ranking', accountId, id], queryFn: ({ signal }) => client!.getRanking!(id, signal), enabled: enabled && active && !!client?.getRanking, notifyOnChangeProps: active ? undefined : [], ...options });
}

export function useMajdataDemoScores() {
  usePluginRevision();
  const active = useCachedTabActive();
  const accountId = useSession(s => s.activeAccountId);
  const client = useSession(state => state.sourceClient) as MajdataDataSource | undefined;
  const bound = !!client?.readDemoPage;
  const query = useInfiniteQuery({ meta: { pluginId: 'game.majdata-net', gameId: 'majdata-net', sourcePluginId: getGameResourceSource('majdata-net')?.id, accountId },
    queryKey: ['majdata-net', 'demo-scores', accountId], initialPageParam: 0,
    queryFn: ({ pageParam, signal }) => client!.readDemoPage!(pageParam, signal),
    getNextPageParam: (last, pages) => last.songCount < 30 ? undefined : pages.length,
    enabled: active && bound, notifyOnChangeProps: active ? undefined : [], ...options,
  });
  const records = useMemo(() => {
    const seen = new Set<string>();
    return (query.data?.pages.flatMap(page => page.records) ?? []).filter(record => {
      const key = `${record.chartInfo.id}:${record.chartLevel}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [query.data?.pages]);
  return { ...query, bound, records };
}
