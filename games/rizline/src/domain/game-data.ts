import type { GameDataStatus } from '@rranker/sdk/data-load';
import { type AccountSummary, type GameDataBundle } from '@rranker/sdk/data';
import { buildRizlineRecords, selectRizlineBest, formatRizlineRks, type RizlineCatalogData, type RizlineSnapshot } from '@rranker/game-rizline/domain/rizline';

export type RizlineGameDataPayload = ReturnType<typeof rizlinePayloadFromSnapshot>;

export function rizlinePayloadFromSnapshot(snapshot: RizlineSnapshot, catalog?: RizlineCatalogData) {
  const records = buildRizlineRecords(snapshot.save, catalog?.snapshot);
  const { userId, username, totalRks, rizcard } = snapshot.save;
  return { kind: 'rizline' as const, snapshot, player: { userId, username, totalRks, rizcard }, records,
    requiresLogin: snapshot.requiresLogin === true,
    best: selectRizlineBest(records), source: snapshot.source, catalogSource: catalog?.source,
    playerScore: { label: 'Ranking Score', value: totalRks, display: formatRizlineRks(totalRks) } };
}

export function summarizeData(bundle: GameDataBundle): AccountSummary | null {
  const p = bundle.payload;
  if (p.kind !== 'rizline') return null;
  const { providerId } = bundle;
  return { scoreDisplay: p.playerScore.display, displayName: p.player.username,
      storedDisplayName: providerId === 'rizline-official' ? p.player.username : undefined };
}

declare module '@rranker/sdk/data' {
  interface GamePayloads {
    'rizline': RizlineGameDataPayload;
  }
}

export function getDataStatus(bundle: GameDataBundle): GameDataStatus {
  const payload = bundle.payload;
  if (payload.kind !== 'rizline') return { isStale: false };
  return { isStale: payload.source.isStale || payload.catalogSource?.isStale === true,
    ...(payload.requiresLogin ? { failure: { code: 'authentication', target: 'data', diagnostic: '登录已失效', retryable: false } as const } : {}),
  };
}
