import type { MajdataResources , MajdataDataSource } from '@rranker/game-majdata-net/data-source';
import { majdataProvider } from './providers/majdata-provider';
import type { SourceClientContext } from '@rranker/sdk/credentials';


import { parseCredential } from './credential';

export function createClient(context: SourceClientContext): MajdataDataSource {
  const credential = parseCredential(context.credential);
  return { getRanking: (id, signal) => majdataProvider.getRanking(id, signal), readCached: async () => (await import('./services/majdata-service')).loadMajdataCached(context.account.id),
    ...(credential ? { readFresh: async (signal: AbortSignal) => (await import('./services/majdata-service')).loadMajdataFresh(context, signal) } : {}) };
}

export function createResources(): MajdataResources {
 return { getSongs: (page, sort, search, signal) => majdataProvider.getSongs(page, sort, search, signal),
  loadSong: async (...args) => (await import('./services/majdata-service')).loadMajdataSong(...args),
  readSongSnapshot: async (...args) => (await import('./services/majdata-service')).loadMajdataSongSnapshot(...args),
  loadChart: async (...args) => (await import('./services/majdata-service')).loadMajdataChart(...args),
  loadParsedChart: async (...args) => (await import('./services/majdata-service')).loadMajdataParsedChart(...args) };
}
