import type { GameDataLoaderContext, GameDataLoadResult } from '@rranker/sdk/data-load';
import { emptyGamePayload } from '@rranker/sdk/data';
import type { PhigrosDataSource } from '../data-source';
import { getGameProfile } from '@rranker/sdk/domain/game-profile';

export async function loadData(context: GameDataLoaderContext): Promise<GameDataLoadResult> {
  const client = context.client as PhigrosDataSource | undefined;
  const payload = client ? await client.loadPayload(context) : emptyGamePayload('phigros', 'Phigros');
  context.assertCurrent();
  return { bundle: { gameId: 'phigros', providerId: context.activeProviderId, profile: getGameProfile('phigros'), payload } };
}
