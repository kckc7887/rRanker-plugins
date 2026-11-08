import { normalizeOsuBeatmapsetDetail, normalizeOsuBeatmapUserScore, normalizeOsuCatalogSongs } from '@rranker/game-osu/domain/osu';
import type { SourceClientContext } from '@rranker/sdk/credentials';
import type { OsuDataSource } from '@rranker/game-osu/data-source';
import { isOsuGameId } from '@rranker/game-osu';
import { osuUserIdFromAccountId } from '@rranker/game-osu/accounts';
import { loadOsuSnapshotFresh, OsuCache } from '@rranker/provider-osu/services/osu-cache';
import { OsuScoreProvider } from './providers/osu-score-provider';
import { parseCredential } from './credential';

export function createClient(context: SourceClientContext): OsuDataSource | undefined {
  const credential = parseCredential(context.credential), gameId = context.account.gameId;
  const userId = osuUserIdFromAccountId(context.account.id);
  if (!credential || !isOsuGameId(gameId) || userId === null) return undefined;
  const provider = new OsuScoreProvider(credential, (next, expected) => context.commitCredential(next, expected));
  const cache = new OsuCache();
  return {
    userId,
    readKnownScores: () => cache.loadKnownScores(gameId, userId),
    mergeKnownScores: (scores, assertCurrent) => cache.mergeKnownScores(gameId, userId, scores, assertCurrent),
    getBeatmapset: async (id, signal) => normalizeOsuBeatmapsetDetail(await provider.getBeatmapset(id, signal), gameId),
    searchCatalog: async (params, cursor, signal) => {
      const raw = await provider.searchBeatmapsets({ ...params, cursor }, signal);
      return { songs: normalizeOsuCatalogSongs(raw, gameId), total: raw.total,
        recommendedDifficulty: raw.recommended_difficulty ?? null, cursor: raw.cursor_string ?? null };
    },
    getBeatmapScore: async (song, beatmap, signal) => {
      const raw = await provider.getUserBeatmapScore(userId, beatmap.id, gameId, signal);
      return raw ? normalizeOsuBeatmapUserScore(raw, gameId,
        { id: beatmap.id, beatmapSetId: song.beatmapSetId, difficultyRating: beatmap.difficultyRating, version: beatmap.version },
        { id: song.beatmapSetId, title: song.title, artist: song.artist, creator: song.creator, listCover: song.cover }) : null;
    },
    readCached: () => cache.load(gameId, userId), readFresh: signal => loadOsuSnapshotFresh(provider, gameId, userId, signal),
    persist: (snapshot, assertCurrent) => cache.save(gameId, userId, snapshot, assertCurrent) };
}
