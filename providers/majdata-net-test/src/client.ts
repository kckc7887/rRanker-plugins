import { resolveGameResources } from '@rranker/sdk/registry';
import type { MajdataResources , MajdataDataSource } from '@rranker/game-majdata-net/data-source';
import { MAJDATA_ORDER, type MajdataScore } from '@rranker/game-majdata-net/domain/majdata';
import { loadItemsBounded } from '@rranker/sdk/services/offset-pagination';
import type { SourceClientContext } from '@rranker/sdk/credentials';
import { maxedMajdataSnapshot, buildMaxedMajdataScore } from './providers/maxed-majdata-test-provider';
export function createClient({ account }: SourceClientContext): MajdataDataSource {
  return { createDemoScore: buildMaxedMajdataScore, readDemoPage: loadMajdataDemoScoresPage, readCached: async () => null, readFresh: async () => maxedMajdataSnapshot(account.displayName),
    playerScore: { label: 'DX · Classic', value: 114514, display: '114514.0000%' } };
}

export async function loadMajdataDemoScoresPage(page: number, signal: AbortSignal) {
  const resources = resolveGameResources('majdata-net') as MajdataResources | undefined;
  if (!resources) throw new Error('Majdata 曲库来源不可用');
  const [{ getAvailableDifficulties, parseSimaiChartAsync, SimaiParseError }, { simaiStatistics }] = await Promise.all([
    import('@rranker/chart-simai/features/simai-chart-preview/engine/core/parser/SimaiParser'),
    import('@rranker/chart-simai/features/simai-chart-preview/statistics'),
  ]);
  const songs = await resources.getSongs(page, 'timep', '', signal);
  const records: MajdataScore[][] = Array.from({ length: songs.length }, () => []);
  await loadItemsBounded({
    items: songs.map((song, index) => ({ song, index })), concurrency: 4, signal, failureMode: 'throw',
    load: async ({ song, index }) => {
      const levels = MAJDATA_ORDER.filter(level => song.levels[level]?.trim());
      if (!levels.length) return;
      const text = await resources.loadChart(song, signal);
      const available = getAvailableDifficulties(text);
      for (const level of levels) {
        if (!available[level + 1]) continue;
        let chart: Awaited<ReturnType<typeof parseSimaiChartAsync>>;
        try { chart = await parseSimaiChartAsync(text, level + 1, signal); }
        catch (error) {
          if (!(error instanceof SimaiParseError)) throw error;
          continue;
        }
        const statistics = simaiStatistics(chart);
        const record = buildMaxedMajdataScore(song, level, statistics.counts);
        if (record.dxScore !== 0) records[index].push(record);
      }
    },
  });
  return { records: records.flat(), songCount: songs.length };
}
