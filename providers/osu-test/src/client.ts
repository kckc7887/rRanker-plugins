import type { SourceClientContext } from '@rranker/sdk/credentials';
import type { OsuDataSource } from '@rranker/game-osu/data-source';
import { isOsuGameId } from '@rranker/game-osu';
import { OsuPublicCatalogProvider } from '@rranker/provider-osu/providers/osu-public-catalog-provider';
import { buildMaxedOsuBestScores, buildMaxedOsuBeatmapsetScores, maxedOsuPlayerSnapshot } from './providers/maxed-osu-test-provider';

export function createClient({ account }: SourceClientContext): OsuDataSource | undefined {
  const gameId = account.gameId;
  if (!isOsuGameId(gameId)) return undefined;
  const provider = new OsuPublicCatalogProvider();
  return {
    createDemoScores: buildMaxedOsuBeatmapsetScores,
    readCached: async () => null, readFresh: async () => maxedOsuPlayerSnapshot(account.displayName),
    getBeatmapset: (id, signal) => provider.getBeatmapset(id, gameId, signal),
    searchCatalog: async (params, cursor, signal) => {
      const page = await provider.searchBeatmapsets({ gameId, page: Number(cursor ?? 0), q: params.q }, signal);
      return { songs: page.songs.map(song => ({ beatmapSetId: song.beatmapSetId, title: song.title,
        artist: song.artist, creator: song.creator, listCover: song.cover,
        difficultyRatings: song.beatmaps.map(beatmap => beatmap.difficultyRating).sort((a, b) => a - b) })),
        recommendedDifficulty: null, cursor: page.nextPage === undefined ? null : String(page.nextPage) };
    },
    readDemoPage: async (page, signal) => {
      const result = await provider.searchBeatmapsets({ gameId, page, rankedOnly: true }, signal);
      return { scores: buildMaxedOsuBestScores(result.songs), nextPage: result.nextPage };
    },
  };
}
