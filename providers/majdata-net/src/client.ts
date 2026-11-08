import type { MajdataResources , MajdataDataSource } from '@rranker/game-majdata-net/data-source';
import { majdataProvider } from './providers/majdata-provider';
import { loadMajdataSong, loadMajdataSongSnapshot, loadMajdataChart, loadMajdataParsedChart , loadMajdataCached, loadMajdataFresh } from './services/majdata-service';
import type { SourceClientContext } from '@rranker/sdk/credentials';


import { parseCredential } from './credential';

export function createClient(context: SourceClientContext): MajdataDataSource {
  const credential = parseCredential(context.credential);
  return { getRanking: (id, signal) => majdataProvider.getRanking(id, signal), readCached: () => loadMajdataCached(context.account.id),
    ...(credential ? { readFresh: (signal: AbortSignal) => loadMajdataFresh(context, signal) } : {}) };
}

export function createResources(): MajdataResources {
 return { getSongs: (page, sort, search, signal) => majdataProvider.getSongs(page, sort, search, signal),
  loadSong: loadMajdataSong, readSongSnapshot: loadMajdataSongSnapshot, loadChart: loadMajdataChart, loadParsedChart: loadMajdataParsedChart };
}
