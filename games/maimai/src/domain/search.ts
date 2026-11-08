import type { Song } from './models';
import { buildSongSearchIndex, EMPTY_SONG_FILTERS, type SongChartPredicate, type SongSearchEntry, type SongSearchFilters } from '@rranker/sdk/utils/search';
import { matchesSongSearch as matchesSearch, searchSongs as search } from '@rranker/sdk/utils/search';

function chartFilter(filters: SongSearchFilters, predicate?: SongChartPredicate<Song>): SongChartPredicate<Song> {
  const hasConstant = filters.constantMin !== undefined || filters.constantMax !== undefined;
  return (song, chart) => !(hasConstant && chart.type === 'UTAGE') && (!predicate || predicate(song, chart));
}

export function matchesSongSearch(song: Song, filters: SongSearchFilters, predicate?: SongChartPredicate<Song>): boolean {
  return matchesSearch(song, filters, chartFilter(filters, predicate));
}

export function searchSongs(index: readonly SongSearchEntry<Song>[], filters: SongSearchFilters, predicate?: SongChartPredicate<Song>): Song[] {
  return search(index, filters, chartFilter(filters, predicate));
}

export function filterSongs(songs: Song[], keyword: string): Song[] {
  return searchSongs(buildSongSearchIndex(songs), { ...EMPTY_SONG_FILTERS, keyword });
}
